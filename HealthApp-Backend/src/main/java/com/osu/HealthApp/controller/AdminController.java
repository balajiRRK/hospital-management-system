package com.osu.HealthApp.controller;

import com.osu.HealthApp.dtos.SimpleUserRequest;
import com.osu.HealthApp.dtos.UserRoleRequest;
import com.osu.HealthApp.dtos.UserRoleResponse;
import com.osu.HealthApp.models.Role;
import com.osu.HealthApp.models.User;
import com.osu.HealthApp.repo.UserRepository;
import com.osu.HealthApp.service.AuthService;
import com.osu.HealthApp.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashSet;
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
	
	@PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/addroles", consumes = "application/json", produces = "application/json")
    public ResponseEntity<UserRoleResponse> addRoles(@Valid @RequestBody UserRoleRequest req) {
		String email = req.email().trim().toLowerCase();
		Set<String> roles = req.roles();
		Set<Role> enumRoles = new HashSet<Role>();
		for (String role : roles) {
			try {
				enumRoles.add(Role.valueOf(role));
			} catch (IllegalArgumentException e) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + role );
			}
		}
		
        return ResponseEntity.ok(new UserRoleResponse(email, userService.addRoles(req.email().trim().toLowerCase(), enumRoles)));
    }
	
	@PreAuthorize("hasRole('ADMIN')")
    @PostMapping(value = "/removeroles", consumes = "application/json", produces = "application/json")
    public ResponseEntity<UserRoleResponse> removeRoles(@Valid @RequestBody UserRoleRequest req) {
		String email = req.email().trim().toLowerCase();
		Set<String> roles = req.roles();
		Set<Role> enumRoles = new HashSet<Role>();
		for (String role : roles) {
			try {
				enumRoles.add(Role.valueOf(role));
			} catch (IllegalArgumentException e) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + role );
			}
		}
		
		return ResponseEntity.ok(new UserRoleResponse(email, userService.removeRoles(email, enumRoles)));
    }
}