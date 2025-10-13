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

}
