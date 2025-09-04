package com.osu.HealthApp.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nurse")
public class NurseController {
    @PreAuthorize("hasAnyRole('NURSE','ADMIN')")
    @GetMapping("/tasks")
    public Map<String, Object> tasks() {
        return Map.of("section", "nurse", "tasks", List.of("Vitals", "Meds cart"));
    }
}