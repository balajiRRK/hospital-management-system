package com.osu.HealthApp.dtos;

import lombok.Data;

@Data
public class HealthMetricDto {
    private Double weight; // expecting pounds
    private Double height; // expecting meters
}