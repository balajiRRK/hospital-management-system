package com.osu.HealthApp.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;

@Entity
@Data
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User patient;

    @ManyToOne(optional = false)
    private User doctor;

    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String reason;
}