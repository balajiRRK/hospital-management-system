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
	
	@PreAuthorize("allOf(hasRole(\"NURSE\"), hasAuthority(\"CONTEXT_STAFF\"))")
	@PostMapping("/submitNote")
	public ResponseEntity<Void> submitNote(@RequestBody AppointmentNoteResultRequest request) {
		appointmentService.submitNurseNote(request);
		return ResponseEntity.ok().build();
	}
	
	@PreAuthorize("allOf(hasRole(\"DOCTOR\"), hasAuthority(\"CONTEXT_STAFF\"))")
	@PostMapping("/submitResult")
	public ResponseEntity<Void> submitResult(@RequestBody AppointmentNoteResultRequest request) {
		appointmentService.submitDoctorResult(request);
		return ResponseEntity.ok().build();
	}
	
	@PreAuthorize("allOf(hasAnyRole(\"NURSE\", \"DOCTOR\"), hasAuthority(\"CONTEXT_STAFF\"))") //For HIPPA reasons, only relevant medical staff should be able to pull sensitive medical info
	@GetMapping("/{appointmentId}/note")
	public String getNote(@PathVariable Long appointmentId) {
		return appointmentService.getNurseNote(appointmentId);
	}
	
	@PreAuthorize("anyOf(allOf(hasRole(\"DOCTOR\"), hasAuthority(\"CONTEXT_STAFF\")), allOf(hasRole(\"PATIENT\"), hasAuthority(\"CONTEXT_PATIENT\")))") //For HIPPA reasons, only relevant medical staff (or for the result, the relevant patient) should be able to pull sensitive medical info
	@GetMapping("/{appointmentId}/result")
	public String getResult(@PathVariable Long appointmentId) {
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
