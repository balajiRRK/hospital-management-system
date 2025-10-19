package com.osu.HealthApp.service;

import com.osu.HealthApp.dtos.PasswordResetDto;
import com.osu.HealthApp.dtos.UserProfileDto;
import com.osu.HealthApp.dtos.UserProfileResponseDto;
import com.osu.HealthApp.models.Address;
import com.osu.HealthApp.models.EmergencyContact;
import com.osu.HealthApp.models.Role;
import com.osu.HealthApp.models.User;
import com.osu.HealthApp.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Utilities;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

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

    @Transactional(readOnly = true)
    public UserProfileResponseDto getUserProfileById(Long id) {
        User user = users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return toUserProfileResponseDto(user);
    }

    private UserProfileResponseDto toUserProfileResponseDto(User user) {
        UserProfileResponseDto dto = new UserProfileResponseDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setGender(user.getGender());

        if (user.getAddress() != null) {
            Address address = user.getAddress();
            UserProfileResponseDto.AddressDto addressDto = new UserProfileResponseDto.AddressDto();
            addressDto.setStreetAddress(address.getStreetAddress());
            addressDto.setCity(address.getCity());
            addressDto.setState(address.getState());
            addressDto.setPostalCode(address.getPostalCode());
            addressDto.setCountry(address.getCountry());
            dto.setAddress(addressDto);
        }

        if (user.getEmergencyContact() != null) {
            EmergencyContact contact = user.getEmergencyContact();
            UserProfileResponseDto.EmergencyContactDto contactDto = new UserProfileResponseDto.EmergencyContactDto();
            contactDto.setName(contact.getName());
            contactDto.setPhoneNumber(contact.getPhoneNumber());
            dto.setEmergencyContact(contactDto);
        }

        return dto;
    }

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
    public UserProfileResponseDto updateUserProfile(Long userId, UserProfileDto profileDto) {
        User user = getUserById(userId);
        user.setFirstName(profileDto.getFirstName());
        user.setLastName(profileDto.getLastName());
        user.setEmail(profileDto.getEmail());
        user.setPhoneNumber(profileDto.getPhoneNumber());
        user.setDateOfBirth(profileDto.getDateOfBirth());
        user.setGender(profileDto.getGender());

        UserProfileDto.AddressDto addressDto = profileDto.getAddress();
        if (addressDto != null) {
            Address address = user.getAddress() == null ? new Address() : user.getAddress();
            address.setStreetAddress(addressDto.getStreetAddress());
            address.setCity(addressDto.getCity());
            address.setState(addressDto.getState());
            address.setPostalCode(addressDto.getPostalCode());
            address.setCountry(addressDto.getCountry());
            user.setAddress(address);
        }

        UserProfileDto.EmergencyContactDto contactDto = profileDto.getEmergencyContact();
        if (contactDto != null) {
            EmergencyContact contact = user.getEmergencyContact() == null ? new EmergencyContact() : user.getEmergencyContact();
            contact.setName(contactDto.getName());
            contact.setPhoneNumber(contactDto.getPhoneNumber());
            user.setEmergencyContact(contact);
        }
        User savedUser = users.save(user);
        return toUserProfileResponseDto(savedUser);
    }

    public User getUserFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }
        String email = authentication.getName();
        return users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }


    @Transactional
    public String updateProfilePhoto(Long userId, MultipartFile file) {
        User user = getUserById(userId);

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only image uploads are allowed");
        }

        String safeName = file.getOriginalFilename() != null
                ? file.getOriginalFilename().replaceAll("\\s+", "_")
                : "upload";
        String key = "profile-photos/" + userId + "/" + UUID.randomUUID() + "-" + safeName;

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType)
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            S3Utilities utils = s3Client.utilities();
            String fileUrl = utils.getUrl(GetUrlRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build()).toExternalForm();

            user.setProfilePhotoUrl(fileUrl);
            users.save(user);
            return fileUrl;

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to upload profile photo", e);
        } catch (S3Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "S3 upload failed: " + e.awsErrorDetails().errorMessage(), e);
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