package com.osu.HealthApp.dtos;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class AppointmentRequest {
    private Long patientId;
    private Long doctorId;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String reason;
}