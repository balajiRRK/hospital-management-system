package com.osu.HealthApp.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/panel")
    public Map<String, Object> panel() {
        return Map.of("section", "admin", "status", "ok");
    }
}