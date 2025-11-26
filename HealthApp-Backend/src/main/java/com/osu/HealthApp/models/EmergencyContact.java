package com.osu.HealthApp.models;

import jakarta.persistence.*;
import lombok.Data;

/** Optional emergency contact stored alongside the user. */
@Entity
@Table(name = "emergency_contacts")
@Data
public class EmergencyContact {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String phoneNumber;
}
