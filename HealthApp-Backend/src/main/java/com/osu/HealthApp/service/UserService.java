package com.osu.HealthApp.service;

import com.osu.HealthApp.dtos.AddressDto;
import com.osu.HealthApp.dtos.EmergencyContactDto;
import com.osu.HealthApp.dtos.PasswordResetDto;
import com.osu.HealthApp.dtos.UserProfileDto;
import com.osu.HealthApp.models.Address;
import com.osu.HealthApp.models.EmergencyContact;
import com.osu.HealthApp.models.Role;
import com.osu.HealthApp.models.User;
import com.osu.HealthApp.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository users;
    private final S3Client s3Client;
    private final PasswordEncoder passwordEncoder;

    // **FIX 1: Re-added missing S3 configuration values**
    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    public User getUserById(Long id) {
        return users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public String getUserEmailById(Long id) {
        return getUserById(id).getEmail();
    }

    // ... methods for disable/enable account and role management are unchanged ...
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
        Set<Role> newRoles = Stream.concat(user.getRoles().stream(), roles.stream())
                .collect(Collectors.toSet());
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
        Set<Role> newRoles = user.getRoles().stream()
                .filter(role -> !roles.contains(role))
                .collect(Collectors.toSet());
        user.setRoles(newRoles);
        users.save(user);
        return newRoles;
    }

    @Transactional
    public User updateUserProfile(Long userId, UserProfileDto profileDto) {
        User user = getUserById(userId);
        user.setFirstName(profileDto.getFirstName());
        user.setLastName(profileDto.getLastName());
        user.setEmail(profileDto.getEmail());
        user.setPhoneNumber(profileDto.getPhoneNumber());
        user.setDateOfBirth(profileDto.getDateOfBirth());
        user.setGender(profileDto.getGender());

        AddressDto addressDto = profileDto.getAddress();
        if (addressDto != null) {
            Address address = user.getAddress() == null ? new Address() : user.getAddress();
            address.setStreetAddress(addressDto.getStreetAddress());
            address.setCity(addressDto.getCity());
            address.setState(addressDto.getState());
            address.setPostalCode(addressDto.getPostalCode());
            address.setCountry(addressDto.getCountry());
            user.setAddress(address);
        }

        EmergencyContactDto contactDto = profileDto.getEmergencyContact();
        if (contactDto != null) {
            EmergencyContact contact = user.getEmergencyContact() == null ? new EmergencyContact() : user.getEmergencyContact();
            contact.setName(contactDto.getName());
            contact.setPhoneNumber(contactDto.getPhoneNumber());
            user.setEmergencyContact(contact);
        }
        return users.save(user);
    }

    @Transactional
    public String updateProfilePhoto(Long userId, MultipartFile file) {
        User user = getUserById(userId);
        String key = "profile-photos/" + userId + "/" + UUID.randomUUID() + "-" + file.getOriginalFilename();
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName).key(key).contentType(file.getContentType()).build();
            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            String fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, key);
            user.setProfilePhotoUrl(fileUrl);
            users.save(user);
            return fileUrl;
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload profile photo", e);
        }
    }

    @Transactional
    public void updateUserPassword(Long userId, PasswordResetDto passwordDto) {
        User user = getUserById(userId);
        if (!passwordEncoder.matches(passwordDto.getCurrentPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect current password");
        }
        user.setPasswordHash(passwordEncoder.encode(passwordDto.getNewPassword()));
        users.save(user);
    }
}