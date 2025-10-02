package com.osu.HealthApp.controller;

import com.osu.HealthApp.models.User;
import com.osu.HealthApp.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService us) {
        this.userService = us;
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping("/{id}/email")
    public String getUserEmail(@PathVariable Long id) {
        return userService.getUserEmailById(id);
    }
}
