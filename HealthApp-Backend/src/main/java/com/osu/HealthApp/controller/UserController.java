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
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/** Endpoints for users to manage their own profile plus staff lookup by id. */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** Read-only view of the authenticated user's profile. */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponseDto> getMyProfile(Authentication authentication) {
        User user = userService.getUserFromAuthentication(authentication);
        return ResponseEntity.ok(userService.getUserProfileById(user.getId()));
    }

    /** Update mutable profile fields for the currently logged in user. */
    @PutMapping("/me/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserProfileResponseDto> updateMyProfile(Authentication authentication,
            @Valid @RequestBody UserProfileDto profileDto) {
        User user = userService.getUserFromAuthentication(authentication);
        return ResponseEntity.ok(userService.updateUserProfile(user.getId(), profileDto));
    }

    /** Upload a new profile photo to S3 and return its public URL. */
    @PostMapping(path = "/me/profile-photo", consumes = "multipart/form-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadMyProfilePhoto(Authentication authentication,
            @RequestParam("file") MultipartFile file) {
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

    /** Change password after validating the current password. */
    @PostMapping("/me/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> resetMyPassword(Authentication authentication,
            @Valid @RequestBody PasswordResetDto passwordDto) {
        User user = userService.getUserFromAuthentication(authentication);
        userService.updateUserPassword(user.getId(), passwordDto);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }

    /** Staff-only lookup of any user's profile by id. */
    @GetMapping("/{userId}")
    @PreAuthorize("hasAuthority('CONTEXT_STAFF')")
    public ResponseEntity<UserProfileResponseDto> getUserById(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserProfileById(userId));
    }
}
