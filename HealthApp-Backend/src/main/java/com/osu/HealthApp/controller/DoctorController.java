package com.osu.HealthApp.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    @GetMapping("/notes")
    public Map<String, Object> notes() {
        return Map.of(
                "section", "doctor",
                "notes", List.of("Patient A stable", "Patient B needs follow-up")
        );
    }
}