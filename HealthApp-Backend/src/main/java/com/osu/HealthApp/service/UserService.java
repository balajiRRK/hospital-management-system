package com.osu.HealthApp.service;

import com.osu.HealthApp.models.User;
import com.osu.HealthApp.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository ur) {
        this.userRepository = ur;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public String getUserEmailById(Long id) {
        return getUserById(id).getEmail();
    }
}
