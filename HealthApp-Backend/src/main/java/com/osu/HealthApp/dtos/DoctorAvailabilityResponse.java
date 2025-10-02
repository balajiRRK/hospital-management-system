package com.osu.HealthApp.dtos;

import lombok.Data;

import java.util.List;

@Data
public class DoctorAvailabilityResponse {
    private Long doctorId;
    private String date;       // ISO yyyy-MM-dd
    private List<String> slots; //like  ["09:00","09:15"]
}