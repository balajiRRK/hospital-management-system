package com.osu.HealthApp.dtos;

import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class AppointmentResponse {
    private Long id;
    private Long patientId;
    private Long doctorId;
    private String patientName;
    private String doctorName;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String reason;
}