package com.osu.HealthApp.models;

import jakarta.persistence.*;
import lombok.Data;

/** Embedded address for a user record. */
@Entity
@Table(name = "addresses")
@Data
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String streetAddress;
    private String city;
    private String state;
    private String postalCode;
    private String country;
}
