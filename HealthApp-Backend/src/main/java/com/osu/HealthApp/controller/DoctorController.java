package com.osu.HealthApp.Controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.*;

/**
 * Example protected API:
 * GET /api/doctor/me -> requires ROLE_DOCTOR or ROLE_ADMIN (see @PreAuthorize)
 */


@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    public DoctorMeResponse me(Authentication auth) {
        return new DoctorMeResponse(auth.getName(), "You have access to doctor resources.");
    }

    public record DoctorMeResponse(String email, String message) {}
}