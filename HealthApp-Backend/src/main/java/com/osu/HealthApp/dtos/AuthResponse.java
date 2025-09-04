package com.osu.HealthApp.DTOs;

import com.osu.HealthApp.Role;

import java.util.Set;

public record AuthResponse(String email, Set<Role> roles) {}