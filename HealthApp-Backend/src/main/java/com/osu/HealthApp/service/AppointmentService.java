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

    // Scheduling 90min visit, 15min gap, 15min grid, day 09:00–17:00
    private static final int SLOT_MINUTES = 90;
    private static final int GAP_MINUTES = 15;   // buffer between visits
    private static final int STEP_MINUTES = 15;   // grid step for availability
    private static final LocalTime DAY_START = LocalTime.of(9, 0);
    private static final LocalTime DAY_END = LocalTime.of(17, 0); // exclusive end

    // Use the server's local time zone for wall-time calculations
    private static final ZoneId SYSTEM_ZONE = ZoneId.systemDefault();

    public AppointmentService(AppointmentRepository ar, UserRepository ur) {
        this.appointmentRepository = ar;
        this.userRepository = ur;
    }

    /**
     * Create a new appointment. Patients can only create for themselves
     * Patients can only create for themselves
     * Enforces exact 90 minutes and 15-minute buffer vs existing
     */
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

        var start = request.getStartTime().toLocalDateTime();
        var end = request.getEndTime().toLocalDateTime();

        // enforce 90 min duration
        if (!Duration.between(start, end).equals(Duration.ofMinutes(SLOT_MINUTES))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment must be exactly 90 minutes long");
        }

        ensureDoctorSlotFitsPolicy(doctor.getId(), start, end, null);

        Appointment a = new Appointment();
        a.setPatient(patient);
        a.setDoctor(doctor);
        a.setStartTime(request.getStartTime());
        a.setEndTime(request.getEndTime());
        a.setReason(request.getReason());

        return toResponse(appointmentRepository.save(a));
    }

    /**
     * Update an appointment. Patients can only update their own, and cannot
     * change doctor/patient Enforces exact 90 minutes and buffer policy exclude
     * the same record
     */
    public AppointmentResponse updateAppointment(Long appointmentId, AppointmentRequest request) {
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        if (isPatient()) {
            Long me = getCurrentUserIdOrThrow();
            if (!a.getPatient().getId().equals(me)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Patients can only update their own appointments");
            }
            // patients cannot change doctor/patient
            if ((request.getPatientId() != null && !request.getPatientId().equals(me))
                    || (request.getDoctorId() != null && !request.getDoctorId().equals(a.getDoctor().getId()))) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot change doctor or patient");
            }
        } else if (isStaff()) {
            // staff may change doctor/patient if provided
            if (request.getPatientId() != null && !a.getPatient().getId().equals(request.getPatientId())) {
                a.setPatient(userRepository.findById(request.getPatientId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid patientId")));
            }
            if (request.getDoctorId() != null && !a.getDoctor().getId().equals(request.getDoctorId())) {
                a.setDoctor(userRepository.findById(request.getDoctorId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid doctorId")));
            }
        }

        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startTime and endTime are required");
        }

        var start = request.getStartTime().toLocalDateTime();
        var end = request.getEndTime().toLocalDateTime();

        // enforce 90 min duration
        if (!Duration.between(start, end).equals(Duration.ofMinutes(SLOT_MINUTES))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Appointment must be exactly 90 minutes long");
        }

        ensureDoctorSlotFitsPolicy(a.getDoctor().getId(), start, end, appointmentId);

        a.setStartTime(request.getStartTime());
        a.setEndTime(request.getEndTime());
        a.setReason(request.getReason());

        return toResponse(appointmentRepository.save(a));
    }

    /**
     * Delete an appointment. Staff can delete any Patients can delete only
     * their own
     */
    public void deleteAppointment(Long appointmentId) {
        Appointment a = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));

        if (isPatient() && !isSelf(a.getPatient().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Patients can only delete their own appointments");
        }
        appointmentRepository.delete(a);
    }

    /**
     * List appointments for a patient. Patients can only read their own
     */
    public List<AppointmentResponse> getAppointmentsForPatient(Long patientId) {
        if (isPatient() && !isSelf(patientId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot read another patient’s appointments");
        }
        return appointmentRepository.findByPatientId(patientId).stream().map(this::toResponse).toList();
    }

    /**
     * List appointments for a doctor ,staff-only.
     */
    public List<AppointmentResponse> getAppointmentsForDoctor(Long doctorId) {
        if (!isStaff()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Staff only");
        }
        return appointmentRepository.findByDoctorId(doctorId).stream().map(this::toResponse).toList();
    }

    /**
     * Public availability for a doctor on a given date. - Builds 15-min grid -
     * Filters out slots that overlap any existing appt expanded by 15-min
     * buffer
     */
    public DoctorAvailabilityResponse getAvailabilityForDoctor(Long doctorId, LocalDate date) {
        LocalDateTime gridStart = date.atTime(DAY_START);
        LocalDateTime gridEnd = date.atTime(DAY_END);

        // slightly larger window to catch buffer spillovers
        OffsetDateTime repoStart = toOffset(gridStart.minusMinutes(GAP_MINUTES));
        OffsetDateTime repoEnd = toOffset(gridEnd.plusMinutes(GAP_MINUTES));

        var appts = appointmentRepository.findByDoctorIdAndStartTimeBetween(doctorId, repoStart, repoEnd);

        // Expand each existing appt by the 15-min buffer on both sides
        List<TimeBlock> buffered = new ArrayList<>();
        for (var ap : appts) {
            LocalDateTime s = toLocal(ap.getStartTime());
            LocalDateTime e = toLocal(ap.getEndTime());
            buffered.add(new TimeBlock(s.minusMinutes(GAP_MINUTES), e.plusMinutes(GAP_MINUTES)));
        }

        // Candidate starts every 15 minutes; accept if the full 90-min slot fits
        List<String> free = new ArrayList<>();
        for (LocalDateTime t = gridStart; !t.plusMinutes(SLOT_MINUTES).isAfter(gridEnd); t = t.plusMinutes(STEP_MINUTES)) {
            LocalDateTime tEnd = t.plusMinutes(SLOT_MINUTES);
            LocalDateTime finalT = t;
            boolean overlaps = buffered.stream().anyMatch(b -> intervalsOverlap(finalT, tEnd, b.start(), b.end()));
            if (!overlaps) {
                free.add(t.toLocalTime().toString()); // "HH:mm"
            }
        }

        var r = new DoctorAvailabilityResponse();
        r.setDoctorId(doctorId);
        r.setDate(date.toString());
        r.setSlots(free);
        return r;
    }

    /**
     * Map entity -> DTO for API responses.
     */
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

    /**
     * True if current user has staff context.
     */
    private boolean isStaff() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("CONTEXT_STAFF"::equals);
    }

    /**
     * True if current user has patient context.
     */
    private boolean isPatient() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("CONTEXT_PATIENT"::equals);
    }

    /**
     * True if given userId is the current principal.
     */
    private boolean isSelf(Long userId) {
        return getCurrentUserIdOrThrow().equals(userId);
    }

    /**
     * Get current principals userId or throw 401.
     */
    private Long getCurrentUserIdOrThrow() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        // assuming username == email
        return userRepository.findByEmail(auth.getName())
                .map(User::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    /**
     * Validate that a proposed [start,end) meets buffer rules vs existing
     * appts.
     */
    private void ensureDoctorSlotFitsPolicy(Long doctorId,
            LocalDateTime proposedStart,
            LocalDateTime proposedEnd,
            Long excludeAppointmentId) {
        //open window + or - GAP to catch edge overlaps
        LocalDate day = proposedStart.toLocalDate();
        LocalDateTime dayStart = day.atTime(DAY_START).minusMinutes(GAP_MINUTES);
        LocalDateTime dayEnd = day.atTime(DAY_END).plusMinutes(GAP_MINUTES);

        var sameDay = appointmentRepository.findByDoctorIdAndStartTimeBetween(
                doctorId, toOffset(dayStart), toOffset(dayEnd));

        for (var existing : sameDay) {
            if (excludeAppointmentId != null && excludeAppointmentId.equals(existing.getId())) {
                continue;
            }

            LocalDateTime s = toLocal(existing.getStartTime());
            LocalDateTime e = toLocal(existing.getEndTime());

            // Expand existing appt by the buffer
            LocalDateTime blockFrom = s.minusMinutes(GAP_MINUTES);
            LocalDateTime blockTo = e.plusMinutes(GAP_MINUTES);

            if (intervalsOverlap(proposedStart, proposedEnd, blockFrom, blockTo)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Doctor not available: 90-minute visits require a 15-minute buffer"
                );
            }
        }
    }

    /**
     * Check if [aStart,aEnd) overlaps [bStart,bEnd).
     */
    private static boolean intervalsOverlap(LocalDateTime aStart, LocalDateTime aEnd,
            LocalDateTime bStart, LocalDateTime bEnd) {
        return aStart.isBefore(bEnd) && bStart.isBefore(aEnd);
    }

    /**
     * Convert LocalDateTime to OffsetDateTime using system zone.
     */
    private static OffsetDateTime toOffset(LocalDateTime ldt) {
        return ldt.atZone(SYSTEM_ZONE).toOffsetDateTime();
    }

    /**
     * Convert OffsetDateTime to LocalDateTime in system zone.
     */
    private static LocalDateTime toLocal(OffsetDateTime odt) {
        return odt.atZoneSameInstant(SYSTEM_ZONE).toLocalDateTime();
    }

    /**
     * Simple time-range container used during availability checks.
     */
    private record TimeBlock(LocalDateTime start, LocalDateTime end) {

    }

    public List<AppointmentResponse> getAllAppointments() {
        if (!isStaff()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Staff only");
        }
        return appointmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }
}
