package com.osu.HealthApp.controller;

import com.osu.HealthApp.models.User;
import com.osu.HealthApp.models.Role;
import com.osu.HealthApp.repo.UserRepository;

import lombok.RequiredArgsConstructor;
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
	
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/getusers")
    public Map<String, Set<Role>> getUsers() {
        return users.findAll().stream().collect(Collectors.toMap(User::getEmail, User::getRoles));
    }
}