package com.osu.HealthApp.service;

import com.osu.HealthApp.dtos.AppointmentRequest;
import com.osu.HealthApp.dtos.AppointmentResponse;
import com.osu.HealthApp.dtos.DoctorAvailabilityResponse;
import com.osu.HealthApp.models.Appointment;
import com.osu.HealthApp.models.User;
import com.osu.HealthApp.repo.AppointmentRepository;
import com.osu.HealthApp.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;

    // Scheduling rules
    private static final int SLOT_MINUTES = 60;
    private static final int GAP_MINUTES = 15;
    private static final int STEP_MINUTES = 15;
    private static final LocalTime DAY_START = LocalTime.of(9, 0);
    private static final LocalTime DAY_END = LocalTime.of(17, 0);
    private static final ZoneId CLINIC_ZONE = ZoneId.of("America/New_York");

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        Long patientId;
        if (isPatient()) {
            patientId = getCurrentUserIdOrThrow();
        } else {
            if (request.getPatientId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "patientId is required");
            }
            patientId = request.getPatientId();
        }

        if (request.getDoctorId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "doctorId is required");
        }
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startTime and endTime are required");
        }

        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid patientId"));
        User doctor = userRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid doctorId"));

        OffsetDateTime start = request.getStartTime();
        OffsetDateTime end = request.getEndTime();

        if (!Duration.between(start.toInstant(), end.toInstant()).equals(Duration.ofMinutes(SLOT_MINUTES))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment must be exactly " + SLOT_MINUTES + " minutes long");
        }

        ensureDoctorSlotFitsPolicy(doctor.getId(), start, end, null);

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setStartTime(start);
        appointment.setEndTime(end);
        appointment.setReason(request.getReason());

        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    public AppointmentResponse updateAppointment(Long appointmentId, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        if (isPatient()) {
            Long me = getCurrentUserIdOrThrow();
            if (!appointment.getPatient().getId().equals(me)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Patients can only update their own appointments");
            }
            if ((request.getPatientId() != null && !request.getPatientId().equals(me))
                    || (request.getDoctorId() != null && !request.getDoctorId().equals(appointment.getDoctor().getId()))) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot change doctor or patient");
            }
        }

        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startTime and endTime are required");
        }

        OffsetDateTime start = request.getStartTime();
        OffsetDateTime end = request.getEndTime();

        if (!Duration.between(start.toInstant(), end.toInstant()).equals(Duration.ofMinutes(SLOT_MINUTES))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment must be exactly " + SLOT_MINUTES + " minutes long");
        }

        ensureDoctorSlotFitsPolicy(appointment.getDoctor().getId(), start, end, appointmentId);

        appointment.setStartTime(start);
        appointment.setEndTime(end);
        appointment.setReason(request.getReason());

        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional
    public void deleteAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        if (isPatient() && !isSelf(appointment.getPatient().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Patients can only delete their own appointments");
        }
        appointmentRepository.delete(appointment);
    }

    public List<AppointmentResponse> getAppointmentsForPatient(Long patientId) {
        if (isPatient() && !isSelf(patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot read another patient’s appointments");
        }
        return appointmentRepository.findByPatientId(patientId).stream().map(this::toResponse).toList();
    }

    public List<AppointmentResponse> getAppointmentsForDoctor(Long doctorId) {
        if (!isStaff()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Staff only");
        }
        return appointmentRepository.findByDoctorId(doctorId).stream().map(this::toResponse).toList();
    }

    public DoctorAvailabilityResponse getAvailabilityForDoctor(Long doctorId, LocalDate date) {
        OffsetDateTime dayStartUTC = date.atTime(DAY_START).atZone(CLINIC_ZONE).toOffsetDateTime().withOffsetSameInstant(ZoneOffset.UTC);
        OffsetDateTime dayEndUTC = date.atTime(DAY_END).atZone(CLINIC_ZONE).toOffsetDateTime().withOffsetSameInstant(ZoneOffset.UTC);

        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndStartTimeBetween(doctorId, dayStartUTC, dayEndUTC);

        List<TimeBlock> buffered = new ArrayList<>();
        for (var appointment : appointments) {
            buffered.add(new TimeBlock(
                    appointment.getStartTime().minusMinutes(GAP_MINUTES),
                    appointment.getEndTime().plusMinutes(GAP_MINUTES))
            );
        }

        List<String> freeSlots = new ArrayList<>();
        for (OffsetDateTime t = dayStartUTC; !t.plusMinutes(SLOT_MINUTES).isAfter(dayEndUTC); t = t.plusMinutes(STEP_MINUTES)) {
            OffsetDateTime tEnd = t.plusMinutes(SLOT_MINUTES);
            OffsetDateTime finalT = t;
            boolean overlaps = buffered.stream().anyMatch(b -> intervalsOverlap(finalT, tEnd, b.start(), b.end()));
            if (!overlaps) {
                freeSlots.add(t.atZoneSameInstant(CLINIC_ZONE).toLocalTime().toString());
            }
        }

        DoctorAvailabilityResponse response = new DoctorAvailabilityResponse();
        response.setDoctorId(doctorId);
        response.setDate(date.toString());
        response.setSlots(freeSlots);
        return response;
    }

    private void ensureDoctorSlotFitsPolicy(Long doctorId, OffsetDateTime proposedStart, OffsetDateTime proposedEnd, Long excludeAppointmentId) {
        OffsetDateTime dayStart = proposedStart.with(LocalTime.MIN);
        OffsetDateTime dayEnd = proposedStart.with(LocalTime.MAX);

        List<Appointment> sameDayAppointments = appointmentRepository.findByDoctorIdAndStartTimeBetween(doctorId, dayStart, dayEnd);

        for (var existing : sameDayAppointments) {
            if (excludeAppointmentId != null && excludeAppointmentId.equals(existing.getId())) {
                continue;
            }
            OffsetDateTime blockFrom = existing.getStartTime().minusMinutes(GAP_MINUTES);
            OffsetDateTime blockTo = existing.getEndTime().plusMinutes(GAP_MINUTES);

            if (intervalsOverlap(proposedStart, proposedEnd, blockFrom, blockTo)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Doctor not available: Slot conflicts with another appointment's buffer"
                );
            }
        }
    }

    private static boolean intervalsOverlap(OffsetDateTime aStart, OffsetDateTime aEnd, OffsetDateTime bStart, OffsetDateTime bEnd) {
        return aStart.toInstant().isBefore(bEnd.toInstant()) && bStart.toInstant().isBefore(aEnd.toInstant());
    }

    public List<AppointmentResponse> getAllAppointments() {
        if (!isStaff()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This action is restricted to staff members.");
        }
        return appointmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private record TimeBlock(OffsetDateTime start, OffsetDateTime end) {}

    private AppointmentResponse toResponse(Appointment a) {
        AppointmentResponse r = new AppointmentResponse();
        r.setId(a.getId());
        r.setPatientId(a.getPatient().getId());
        r.setDoctorId(a.getDoctor().getId());
        r.setPatientName(a.getPatient().getFirstName() + " " + a.getPatient().getLastName());
        r.setDoctorName(a.getDoctor().getFirstName() + " " + a.getDoctor().getLastName());
        r.setStartTime(a.getStartTime());
        r.setEndTime(a.getEndTime());
        r.setReason(a.getReason());
        return r;
    }

    private boolean isStaff() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("CONTEXT_STAFF"::equals);
    }

    private boolean isPatient() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_PATIENT"::equals);
    }

    private boolean isSelf(Long userId) {
        return getCurrentUserIdOrThrow().equals(userId);
    }

    private Long getCurrentUserIdOrThrow() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return userRepository.findByEmail(auth.getName())
                .map(User::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}