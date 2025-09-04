package com.osu.HealthApp.DTOs;

import com.osu.HealthApp.Role;

public record RegisterRequest(String email, String password, Role role) {}