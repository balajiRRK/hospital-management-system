package com.osu.HealthApp.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Entity
@Table(name = "health_metrics")
@Data
public class HealthMetric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double weight; // in Pounds
    private Double height; // in meters
    private Double bmi;    // Calculated Body Mass Index

    private Instant recordedAt = Instant.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}