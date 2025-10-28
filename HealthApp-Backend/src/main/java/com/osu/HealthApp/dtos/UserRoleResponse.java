package com.osu.HealthApp.dtos;

import com.osu.HealthApp.models.Role;

import java.util.Set;


public record UserRoleResponse(
        String email,
        Set<Role> roles
) { }