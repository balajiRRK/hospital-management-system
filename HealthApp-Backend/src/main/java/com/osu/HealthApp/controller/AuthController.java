package com.osu.HealthApp.controller;

import com.osu.HealthApp.dtos.AuthResponse;
import com.osu.HealthApp.dtos.LoginRequest;
import com.osu.HealthApp.dtos.RegisterRequest;
import com.osu.HealthApp.models.Context;
import com.osu.HealthApp.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Auth endpoints: register/login/refresh/logout. */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /** Register a new user (defaults to PATIENT). */
    @PostMapping(value = "/register", consumes = "application/json", produces = "application/json")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    /** Login: sets ACCESS_TOKEN and REFRESH_TOKEN cookies for a patient-context login. */
    @PostMapping(value = "/loginpatient", consumes = "application/json", produces = "application/json")
    public ResponseEntity<AuthResponse> loginPatient(@Valid @RequestBody LoginRequest req) {
        return authService.login(req, Context.PATIENT);
    }
	
	/** Login: sets ACCESS_TOKEN and REFRESH_TOKEN cookies for a staff-context login. */
    @PostMapping(value = "/loginstaff", consumes = "application/json", produces = "application/json")
    public ResponseEntity<AuthResponse> loginStaff(@Valid @RequestBody LoginRequest req) {
        return authService.login(req, Context.STAFF);
    }

    /** Refresh: rotates refresh token; issues new access + refresh cookies. */
    @PostMapping(value = "/refresh", produces = "application/json")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        return authService.refresh(request);
    }

    /** Logout: revokes all refresh tokens for user and clears cookies. */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal UserDetails principal) {
        return authService.logoutByEmail(principal != null ? principal.getUsername() : null);
    }
}