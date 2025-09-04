package com.osu.HealthApp.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "refresh_tokens", indexes = @Index(name="idx_rt_user", columnList="user_id"))
@Getter @Setter
public class RefreshToken {
    @Id
    private String jti; // token id (UUID)

    @ManyToOne(optional=false)
    private User user;

    private Instant expiresAt;
    private boolean revoked = false;
}