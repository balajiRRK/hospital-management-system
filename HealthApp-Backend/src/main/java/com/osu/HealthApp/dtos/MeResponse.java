package com.osu.HealthApp.dtos;

import java.util.List;

public record MeResponse(Long id, String email, List<String> authorities) {
}