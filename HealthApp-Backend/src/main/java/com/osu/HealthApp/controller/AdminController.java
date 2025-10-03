package com.osu.HealthApp.controller;

import com.osu.HealthApp.models.User;
import com.osu.HealthApp.models.Role;
import com.osu.HealthApp.dtos.SimpleUserRequest;
import com.osu.HealthApp.repo.UserRepository;
import com.osu.HealthApp.service.UserService;
import com.osu.HealthApp.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
	
	private final UserRepository users;
	private final UserService userService;
	private final AuthService authService;
	
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getusers")
    public Map<String, Set<Role>> getUsers() {
        return users.findAll().stream().collect(Collectors.toMap(User::getEmail, User::getRoles));
    }
	
	@PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/deactivate", consumes = "application/json", produces = "application/json")
    public void deactivate(@Valid @RequestBody SimpleUserRequest req) {
		String email = req.email().trim().toLowerCase();
        userService.disableAccount(email);
		authService.logoutByEmail(email);
    }
	
	@PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/activate", consumes = "application/json", produces = "application/json")
    public ResponseEntity<Void> reactivate(@Valid @RequestBody SimpleUserRequest req) {
        userService.enableAccount(req.email().trim().toLowerCase());
		return ResponseEntity.ok().build();
    }
}