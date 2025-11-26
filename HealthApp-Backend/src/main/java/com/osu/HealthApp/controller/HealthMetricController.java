package com.osu.HealthApp.controller;

import com.osu.HealthApp.dtos.HealthMetricDto;
import com.osu.HealthApp.service.HealthMetricService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** Allows users to post new health metrics that are attached to a user record. */
@RestController
@RequestMapping("/api/users/{userId}/health-metrics")
public class HealthMetricController {
    private final HealthMetricService healthMetricService;
    public HealthMetricController(HealthMetricService healthMetricService) { this.healthMetricService = healthMetricService; }

    @PostMapping
    public ResponseEntity<?> addHealthMetric(
            @PathVariable Long userId,
            @RequestBody @Valid HealthMetricDto metricDto
    ) {
        return ResponseEntity.ok(healthMetricService.addHealthMetricForUser(userId, metricDto));
    }
}
