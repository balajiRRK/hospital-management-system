package com.osu.HealthApp.Controller;

import com.osu.HealthApp.DTOs.AuthResponse;
import com.osu.HealthApp.DTOs.LoginRequest;
import com.osu.HealthApp.DTOs.RegisterRequest;
import com.osu.HealthApp.models.User;
import com.osu.HealthApp.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** Register a new user (consider restricting ADMIN creation separately). */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    /** Login: sets ACCESS_TOKEN and REFRESH_TOKEN cookies. */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    /** Refresh: rotates refresh token; issues new access + refresh cookies. */
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        return authService.refresh(request);
    }

    /** Logout: revokes all refresh tokens for user and clears cookies. */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal(expression = "username") String email) {
        return authService.logoutByEmail(email);
    }
}