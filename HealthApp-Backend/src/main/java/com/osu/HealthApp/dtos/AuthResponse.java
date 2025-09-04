package com.osu.HealthApp.dtos;

import com.osu.HealthApp.models.Role;

import java.util.Set;

/**
 * cookies carry tokens. dont echoing raw user input.
 */
public record AuthResponse(
        boolean ok,
        Set<Role> roles
) { }