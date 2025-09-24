package com.osu.HealthApp.dtos;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentResponse {
    private Long id;
    private String patientName;
    private String doctorName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String reason;
}