package com.osu.HealthApp.controller;

import com.osu.HealthApp.dtos.AppointmentRequest;
import com.osu.HealthApp.dtos.AppointmentResponse;
import com.osu.HealthApp.dtos.DoctorAvailabilityResponse;
import com.osu.HealthApp.service.AppointmentService;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/patient/{patientId}")
    public List<AppointmentResponse> getForPatient(@PathVariable Long patientId) {
        return appointmentService.getAppointmentsForPatient(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<AppointmentResponse> getForDoctor(@PathVariable Long doctorId) {
        return appointmentService.getAppointmentsForDoctor(doctorId);
    }

    @GetMapping("/doctor/{doctorId}/patients")
    public List<User> getPatientsForDoctor(@PathVariable Long doctorId) {
        return appointmentService.getPatientsForDoctor(doctorId);
    }

    @GetMapping("/doctor/{doctorId}/availability")
    public DoctorAvailabilityResponse availability(
            @PathVariable Long doctorId,
            @RequestParam String date // "yyyy-MM-dd"
    ) {
        return appointmentService.getAvailabilityForDoctor(doctorId, LocalDate.parse(date));
    }
}