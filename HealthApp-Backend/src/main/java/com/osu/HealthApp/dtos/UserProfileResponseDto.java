package com.osu.HealthApp.dtos;

import com.osu.HealthApp.models.Gender;
import com.osu.HealthApp.models.Role;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class UserProfileResponseDto {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String profilePhotoUrl;
    private LocalDate dateOfBirth;
    private Gender gender;
    private Set<Role> roles;
    private AddressDto address;
    private EmergencyContactDto emergencyContact;

    @Data
    public static class AddressDto {
        private String streetAddress;
        private String city;
        private String state;
        private String postalCode;
        private String country;
    }

    @Data
    public static class EmergencyContactDto {
        private String name;
        private String phoneNumber;
    }
}