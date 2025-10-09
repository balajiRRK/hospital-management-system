package com.osu.HealthApp.service;

import com.osu.HealthApp.models.User;
import com.osu.HealthApp.models.Role;
import com.osu.HealthApp.repo.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;
import java.util.stream.Stream;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository users;

	@Transactional
    public void disableAccount(String email) {
        User user = users.findByEmail(email)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No such user"));
		user.setEnabled(false);
		users.save(user);
    }
	
	@Transactional
    public void enableAccount(String email) {
        User user = users.findByEmail(email)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No such user"));
		user.setEnabled(true);
		users.save(user);
    }
	
	@Transactional
	public Set<Role> addRoles(String email, Set<Role> roles) {
		User user = users.findByEmail(email)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No such user"));
		Set<Role> newRoles = Stream.concat(user.getRoles().stream(), roles.stream()).collect(Collectors.toSet());
		user.setRoles(newRoles);
		users.save(user);
		return newRoles;
	}
	
	@Transactional
	public Set<Role> removeRoles(String email, Set<Role> roles) {
		if (roles.contains(Role.PATIENT)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot remove patient role");
		}
		User user = users.findByEmail(email)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "No such user"));
		Set<Role> newRoles = user.getRoles().stream().filter(role -> !roles.contains(role)).collect(Collectors.toSet());
		user.setRoles(newRoles);
		users.save(user);
		return newRoles;
	}
}