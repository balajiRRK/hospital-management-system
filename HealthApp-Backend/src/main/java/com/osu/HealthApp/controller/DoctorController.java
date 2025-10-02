package com.osu.HealthApp.controller;

import com.osu.HealthApp.models.Role;
import com.osu.HealthApp.repo.UserRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/doctor")
public class DoctorController {

    private final UserRepository users;

    public DoctorController(UserRepository users) {
        this.users = users;
    }

    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN')")
    @GetMapping("/notes")
    public NotesResponse notes() {
        return new NotesResponse(
                "doctor",
                List.of("Patient A stable", "Patient B needs follow-up")
        );
    }

    @GetMapping("/doctors")
    public List<DoctorDto> list() {
        return users.findByRolesContaining(Role.DOCTOR)
                .stream()
                .map(u -> new DoctorDto(u.getId(), u.getEmail()))
                .toList();
    }

    public record DoctorDto(Long id, String email) {
    }

    public record NotesResponse(String section, List<String> notes) {
    }
}