package com.osu.HealthApp.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

public record UserRoleRequest(
        @Email @NotBlank String email,
		@NotEmpty Set<String> roles
) {}