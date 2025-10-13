package com.osu.HealthApp.dtos;

import java.util.Set;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

/** Admin's role-modification payload, requires the email address of the account to act upon and a list of roles to either add or remove */
public record UserRoleRequest(
        @Email @NotBlank String email,
		@NotEmpty Set<String> roles
) {}