package com.osu.HealthApp.dtos;

import lombok.Data;

@Data
public class PasswordResetDto {
    private String currentPassword;
    private String newPassword;
}