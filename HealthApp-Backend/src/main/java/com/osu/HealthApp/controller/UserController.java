package com.osu.HealthApp.controller;

import com.osu.HealthApp.models.User;
import com.osu.HealthApp.dtos.PasswordResetDto;
import com.osu.HealthApp.dtos.UserProfileDto;
import com.osu.HealthApp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/users/{userId}")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Retrieves a full user profile by their ID.
     * @param userId The ID of the user to retrieve.
     * @return The User object.
     */
    @GetMapping
    public ResponseEntity<User> getUserById(@PathVariable Long userId) {
        // Note: Consider returning a DTO instead of the full User entity
        // to avoid exposing sensitive data like password hashes in the future.
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    /**
     * Retrieves just the user's email by their ID.
     * @param userId The ID of the user.
     * @return A map containing the user's email.
     */
    @GetMapping("/email")
    public ResponseEntity<Map<String, String>> getUserEmail(@PathVariable Long userId) {
        String email = userService.getUserEmailById(userId);
        return ResponseEntity.ok(Map.of("email", email));
    }

    /**
     * Updates the text-based information for a user's profile.
     * @param userId The ID of the user to update.
     * @param profileDto The DTO containing the new profile data.
     * @return The updated User object.
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@PathVariable Long userId, @RequestBody UserProfileDto profileDto) {
        return ResponseEntity.ok(userService.updateUserProfile(userId, profileDto));
    }

    /**
     * Handles the profile photo upload for a specific user and saves it to S3.
     * @param userId The ID of the user whose photo is being updated.
     * @param file The image file being uploaded.
     * @return A response entity containing the public URL of the uploaded photo.
     */
    @PostMapping("/profile-photo")
    public ResponseEntity<?> uploadProfilePhoto(@PathVariable Long userId, @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File cannot be empty."));
        }
        try {
            String fileUrl = userService.updateProfilePhoto(userId, file);
            // Return the new photo URL so the frontend can display it immediately
            return ResponseEntity.ok(Map.of("profilePhotoUrl", fileUrl));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    /**
     * Updates the password for a specific user.
     * @param userId The ID of the user.
     * @param passwordDto The DTO containing the new password.
     * @return A success message.
     */
    @PostMapping("/password")
    public ResponseEntity<?> resetPassword(@PathVariable Long userId, @RequestBody PasswordResetDto passwordDto) {
        // Pass the whole DTO to the service
        userService.updateUserPassword(userId, passwordDto);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully."));
    }
}