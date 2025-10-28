package com.osu.HealthApp.dtos;

import com.osu.HealthApp.models.Gender;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserProfileDto {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private Gender gender;
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