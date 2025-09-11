package com.osu.HealthApp.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

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

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String reason;
}