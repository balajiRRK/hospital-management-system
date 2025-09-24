package com.osu.HealthApp.controller;

import com.osu.HealthApp.dtos.AppointmentRequest;
import com.osu.HealthApp.dtos.AppointmentResponse;
import com.osu.HealthApp.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    @Autowired
    private AppointmentService appointmentService;

    @PostMapping("create")
    public AppointmentResponse create(@RequestBody AppointmentRequest request) {
        return appointmentService.createAppointment(request);
    }

    @GetMapping("/patient/{patientId}")
    public List<AppointmentResponse> getForPatient(@PathVariable Long patientId) {
        return appointmentService.getAppointmentsForPatient(patientId);
    }

    // Add more endpoints as needed (e.g., cancel, update)
}