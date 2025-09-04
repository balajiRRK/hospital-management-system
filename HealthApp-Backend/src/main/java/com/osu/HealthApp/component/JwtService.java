package com.osu.HealthApp.Component;

import com.osu.HealthApp.models.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * Issues and validates JWTs (HS256 by default).
 * In production consider RS256 with a keystore and key rotation.
 */
@Component
@RequiredArgsConstructor
public class JwtService {

    @Value("${jwt.issuer}") private String issuer;
    @Value("${jwt.access-ttl-minutes}") private long accessTtlMin;
    @Value("${jwt.refresh-ttl-days}") private long refreshTtlDays;
    @Value("${jwt.hs256-secret}") private String secret;

    private SecretKey hmacKey;

    @PostConstruct
    void init() {
        // Fail fast if the secret is weak. 256-bit key (>=32 bytes) recommended.
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT secret must be at least 256 bits. Set JWT_SECRET env var.");
        }
        this.hmacKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getEmail())
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(accessTtlMin, ChronoUnit.MINUTES)))
                .claim("roles", user.getRoles()) // serialized enum names
                .signWith(hmacKey, Jwts.SIG.HS256)
                .compact();
    }

    public String generateRefreshToken(User user, String jti) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getEmail())
                .issuer(issuer)
                .id(jti)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(refreshTtlDays, ChronoUnit.DAYS)))
                .claim("typ", "refresh")
                .signWith(hmacKey, Jwts.SIG.HS256)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parser().verifyWith(hmacKey).build().parseSignedClaims(token);
    }
}