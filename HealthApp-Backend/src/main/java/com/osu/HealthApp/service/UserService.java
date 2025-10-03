package com.osu.HealthApp.service;

import com.osu.HealthApp.models.User;
import com.osu.HealthApp.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
}