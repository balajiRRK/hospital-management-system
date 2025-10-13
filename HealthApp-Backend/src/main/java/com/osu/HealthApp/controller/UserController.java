package com.osu.HealthApp.controller;

import com.osu.HealthApp.dtos.PasswordResetDto;
import com.osu.HealthApp.dtos.UserProfileDto;
import com.osu.HealthApp.dtos.UserProfileResponseDto;
import com.osu.HealthApp.models.User;
import com.osu.HealthApp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponseDto> getMyProfile(Authentication authentication) {
        User user = userService.getUserFromAuthentication(authentication);
        return ResponseEntity.ok(userService.getUserProfileById(user.getId()));
    }

    @PutMapping("/me/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponseDto> updateMyProfile(Authentication authentication, @RequestBody UserProfileDto profileDto) {
        User user = userService.getUserFromAuthentication(authentication);
        return ResponseEntity.ok(userService.updateUserProfile(user.getId(), profileDto));
    }

    @PostMapping(path = "/me/profile-photo", consumes = "multipart/form-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadMyProfilePhoto(Authentication authentication, @RequestParam("file") MultipartFile file) {
        User user = userService.getUserFromAuthentication(authentication);
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File cannot be empty."));
        }
        try {
            String fileUrl = userService.updateProfilePhoto(user.getId(), file);
            return ResponseEntity.ok(Map.of("profilePhotoUrl", fileUrl));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    @PostMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> resetMyPassword(Authentication authentication, @RequestBody PasswordResetDto passwordDto) {
        User user = userService.getUserFromAuthentication(authentication);
        userService.updateUserPassword(user.getId(), passwordDto);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<UserProfileResponseDto> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserProfileById(userId));
    }
}