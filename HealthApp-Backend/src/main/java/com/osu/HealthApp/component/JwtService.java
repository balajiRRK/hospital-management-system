package com.osu.HealthApp.component;

import com.osu.HealthApp.models.User;
import com.osu.HealthApp.models.Context;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

/**
 * Issues and validates JWTs (HS256). Might have to consider RS256 + rotation if we go in production.
 */
@Component
public class JwtService {

    @Value("${jwt.issuer}")             private String issuer;
    @Value("${jwt.access-ttl-minutes}") private long accessTtlMin;
    @Value("${jwt.refresh-ttl-days}")   private long refreshTtlDays;
    @Value("${jwt.hs256-secret}")       private String secret;

    private SecretKey hmacKey;

    @PostConstruct
    void init() {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("JWT secret must be >= 32 bytes (256 bits). Set JWT_SECRET.");
        }
        this.hmacKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /** Access token: subject=email, roles claim, short TTL. */
    public String generateAccessToken(User u, Context context) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(u.getEmail())
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(Duration.ofMinutes(accessTtlMin))))
                .claim("context", context.name())
                .signWith(hmacKey)
                .compact();
    }

    /** Refresh token: subject=email, jti set by caller, longer TTL. */
    public String generateRefreshToken(User u, Context context, String jti) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(u.getEmail())
                .issuer(issuer)
                .id(jti)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(Duration.ofDays(refreshTtlDays))))
                .claim("type", "refresh")
				.claim("context", context.name())
                .signWith(hmacKey)
                .compact();
    }

    /** Parse & verify signature/exp/issuer. Throws on invalid. */
    public Jws<Claims> parse(String token) {
        return Jwts.parser().verifyWith(hmacKey).build().parseSignedClaims(token);
    }
}