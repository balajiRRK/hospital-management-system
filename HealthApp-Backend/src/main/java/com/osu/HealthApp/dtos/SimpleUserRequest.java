package com.osu.HealthApp.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Admin's role-fetching, deactivation, and reactivation payload, requires only the email address of the account to act upon */
public record SimpleUserRequest(
        @Email @NotBlank String email
) {}