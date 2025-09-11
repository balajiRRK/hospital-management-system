package com.osu.HealthApp.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    private Long patientId;
    private Long doctorId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String reason;
}