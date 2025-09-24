package com.osu.HealthApp.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/patient")
public class PatientController {
    @PreAuthorize("hasAnyRole('PATIENT','ADMIN')")
    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() {
        return Map.of("section", "patient", "message", "Welcome!");
    }
}