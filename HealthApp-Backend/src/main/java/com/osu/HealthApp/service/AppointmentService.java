package com.osu.HealthApp.service;

import com.osu.HealthApp.dtos.AppointmentRequest;
import com.osu.HealthApp.dtos.AppointmentResponse;
import com.osu.HealthApp.dtos.DoctorAvailabilityResponse;
import com.osu.HealthApp.models.Appointment;
import com.osu.HealthApp.models.User;
import com.osu.HealthApp.repo.AppointmentRepository;
import com.osu.HealthApp.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.util.ArrayList;
import java.util.List;

@Service
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

    public AppointmentService(AppointmentRepository ar, UserRepository ur) {
        this.appointmentRepository = ar;
        this.userRepository = ur;
    }

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
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment must be exactly 60 minutes long");
        }

        ensureDoctorSlotFitsPolicy(doctor.getId(), start, end, null);

        Appointment a = new Appointment();
        a.setPatient(patient);
        a.setDoctor(doctor);
        a.setStartTime(start);
        a.setEndTime(end);
        a.setReason(request.getReason());

        return toResponse(appointmentRepository.save(a));
    }

    public AppointmentResponse updateAppointment(Long appointmentId, AppointmentRequest request) {
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        if (isPatient()) {
            Long me = getCurrentUserIdOrThrow();
            if (!a.getPatient().getId().equals(me)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Patients can only update their own appointments");
            }
            if ((request.getPatientId() != null && !request.getPatientId().equals(me)) ||
                    (request.getDoctorId() != null && !request.getDoctorId().equals(a.getDoctor().getId()))) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot change doctor or patient");
            }
        }


        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startTime and endTime are required");
        }


        OffsetDateTime start = request.getStartTime();
        OffsetDateTime end = request.getEndTime();

        if (!Duration.between(start.toInstant(), end.toInstant()).equals(Duration.ofMinutes(SLOT_MINUTES))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment must be exactly 60 minutes long");
        }

        ensureDoctorSlotFitsPolicy(a.getDoctor().getId(), start, end, appointmentId);

        a.setStartTime(start);
        a.setEndTime(end);
        a.setReason(request.getReason());

        return toResponse(appointmentRepository.save(a));
    }


    public void deleteAppointment(Long appointmentId) {
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        if (isPatient() && !isSelf(a.getPatient().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Patients can only delete their own appointments");
        }
        appointmentRepository.delete(a);
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
        // Define the working day in  our timezone, then convert to UTC instants.
        OffsetDateTime dayStartUTC = date.atTime(DAY_START).atZone(CLINIC_ZONE).toOffsetDateTime().withOffsetSameInstant(ZoneOffset.UTC);
        OffsetDateTime dayEndUTC = date.atTime(DAY_END).atZone(CLINIC_ZONE).toOffsetDateTime().withOffsetSameInstant(ZoneOffset.UTC);

        var appts = appointmentRepository.findByDoctorIdAndStartTimeBetween(doctorId, dayStartUTC, dayEndUTC);

        List<TimeBlock> buffered = new ArrayList<>();
        for (var ap : appts) {
            buffered.add(new TimeBlock(
                    ap.getStartTime().minusMinutes(GAP_MINUTES),
                    ap.getEndTime().plusMinutes(GAP_MINUTES))
            );
        }

        List<String> free = new ArrayList<>();
        for (OffsetDateTime t = dayStartUTC; !t.plusMinutes(SLOT_MINUTES).isAfter(dayEndUTC); t = t.plusMinutes(STEP_MINUTES)) {
            OffsetDateTime tEnd = t.plusMinutes(SLOT_MINUTES);
            final OffsetDateTime finalT = t;
            boolean overlaps = buffered.stream().anyMatch(b -> intervalsOverlap(finalT, tEnd, b.start(), b.end()));
            if (!overlaps) {
                // Return the time formatted in our local time for the user
                free.add(t.atZoneSameInstant(CLINIC_ZONE).toLocalTime().toString());
            }
        }

        var r = new DoctorAvailabilityResponse();
        r.setDoctorId(doctorId);
        r.setDate(date.toString());
        r.setSlots(free);
        return r;
    }

    private void ensureDoctorSlotFitsPolicy(Long doctorId,
                                            OffsetDateTime proposedStart,
                                            OffsetDateTime proposedEnd,
                                            Long excludeAppointmentId) {
        // Query for appointments on the same day in UTC.
        OffsetDateTime dayStart = proposedStart.with(LocalTime.MIN);
        OffsetDateTime dayEnd = proposedStart.with(LocalTime.MAX);

        var sameDay = appointmentRepository.findByDoctorIdAndStartTimeBetween(doctorId, dayStart, dayEnd);

        for (var existing : sameDay) {
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

    private static boolean intervalsOverlap(OffsetDateTime aStart, OffsetDateTime aEnd,
                                            OffsetDateTime bStart, OffsetDateTime bEnd) {
        return aStart.toInstant().isBefore(bEnd.toInstant()) && bStart.toInstant().isBefore(aEnd.toInstant());
    }

    // uses the timezone-aware OffsetDateTime
    private record TimeBlock(OffsetDateTime start, OffsetDateTime end) {
    }


    private AppointmentResponse toResponse(Appointment a) {
        AppointmentResponse r = new AppointmentResponse();
        r.setId(a.getId());
        r.setPatientId(a.getPatient().getId());
        r.setDoctorId(a.getDoctor().getId());
        r.setPatientName(a.getPatient().getEmail());
        r.setDoctorName(a.getDoctor().getEmail());
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
                .anyMatch("CONTEXT_PATIENT"::equals);
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