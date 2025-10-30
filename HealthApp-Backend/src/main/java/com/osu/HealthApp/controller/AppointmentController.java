package com.osu.HealthApp.controller;

import com.osu.HealthApp.dtos.AppointmentRequest;
import com.osu.HealthApp.dtos.AppointmentNoteResultRequest;
import com.osu.HealthApp.dtos.AppointmentResponse;
import com.osu.HealthApp.dtos.DoctorAvailabilityResponse;
import com.osu.HealthApp.service.AppointmentService;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService s) {
        this.appointmentService = s;
    }

    @PostMapping
    public AppointmentResponse create(@RequestBody AppointmentRequest request) {
        return appointmentService.createAppointment(request);
    }

    @PreAuthorize("hasRole(\"NURSE\") and hasAuthority(\"CONTEXT_STAFF\")")
    @PostMapping("/submitNote")
    public ResponseEntity<Void> submitNote(@RequestBody AppointmentNoteResultRequest request) {
        System.out.println("Nurse Note submitted successfully for appointmentId: " + request);
        appointmentService.submitNurseNote(request);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole(\"DOCTOR\") and hasAuthority(\"CONTEXT_STAFF\")")
    @PostMapping("/submitResult")
    public ResponseEntity<Void> submitResult(@RequestBody AppointmentNoteResultRequest request) {
        appointmentService.submitDoctorResult(request);
        System.out.println("Doctor Result submitted successfully for appointmentId: " + request);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasAnyRole(\"NURSE\", \"DOCTOR\") and hasAuthority(\"CONTEXT_STAFF\")") //For HIPPA reasons, only relevant medical staff should be able to pull sensitive medical info
    @GetMapping("/{appointmentId}/note")
    public String getNote(@PathVariable Long appointmentId) {
        System.out.println("Fetching Nurse Note for appointmentId: " + appointmentId);
        String note = appointmentService.getNurseNote(appointmentId);
        System.out.println("Retrieved Nurse Note: " + note);
        return appointmentService.getNurseNote(appointmentId);
    }

    @PreAuthorize("(hasRole(\"DOCTOR\") and hasAuthority(\"CONTEXT_STAFF\")) or (hasRole(\"PATIENT\") and hasAuthority(\"CONTEXT_PATIENT\"))") //For HIPPA reasons, only relevant medical staff (or for the result, the relevant patient) should be able to pull sensitive medical info
    @GetMapping("/{appointmentId}/result")
    public String getResult(@PathVariable Long appointmentId) {
        String result = appointmentService.getAppointmentResult(appointmentId);
        System.out.println("Retrieved Appointment Result: " + result);
        return appointmentService.getAppointmentResult(appointmentId);
    }

    @GetMapping("/patient/{patientId}")
    public List<AppointmentResponse> getForPatient(@PathVariable Long patientId) {
        return appointmentService.getAppointmentsForPatient(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<AppointmentResponse> getForDoctor(@PathVariable Long doctorId) {
        return appointmentService.getAppointmentsForDoctor(doctorId);
    }

    @GetMapping("/doctor/{doctorId}/availability")
    public DoctorAvailabilityResponse availability(
            @PathVariable Long doctorId,
            @RequestParam String date // "yyyy-MM-dd"
    ) {
        return appointmentService.getAvailabilityForDoctor(doctorId, LocalDate.parse(date));
    }

    @GetMapping
    public List<AppointmentResponse> getAll() {
        return appointmentService.getAllAppointments();
    }
}
