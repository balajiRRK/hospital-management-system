package com.osu.HealthApp.dtos;

import com.osu.HealthApp.models.Role;

import java.util.Set;

// Response for admin's modification of user roles, returns email and a now-current role list
public record UserRoleResponse(
        String email,
        Set<Role> roles
) { }