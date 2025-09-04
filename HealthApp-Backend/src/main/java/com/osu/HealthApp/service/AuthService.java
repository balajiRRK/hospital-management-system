package com.osu.HealthApp.service;

import com.osu.HealthApp.Component.CookieUtil;
import com.osu.HealthApp.Component.JwtService;
import com.osu.HealthApp.DTOs.AuthResponse;
import com.osu.HealthApp.DTOs.LoginRequest;
import com.osu.HealthApp.DTOs.RegisterRequest;
import com.osu.HealthApp.RefreshToken;
import com.osu.HealthApp.models.User;
import com.osu.HealthApp.repo.RefreshTokenRepository;
import com.osu.HealthApp.repo.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.UUID;

/**
 * Handles register/login/refresh/logout and secure cookie issuance.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final RefreshTokenRepository rts;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final CookieUtil cookies;

    @Value("${cookie.access-name}") private String accessCookieName;
    @Value("${cookie.refresh-name}") private String refreshCookieName;
    @Value("${jwt.access-ttl-minutes}") private long accessTtlMin;
    @Value("${jwt.refresh-ttl-days}") private long refreshTtlDays;

    public ResponseEntity<AuthResponse> register(RegisterRequest req) {
        users.findByEmail(req.email().toLowerCase()).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        });

        var u = new User();
        u.setEmail(req.email().toLowerCase());
        u.setPasswordHash(encoder.encode(req.password()));
        u.getRoles().add(req.role()); // Control this path for ADMINs in your app logic
        users.save(u);

        // Optional: auto-login on register (comment out if you want email verification first)
        return issueTokens(u);
    }

    public ResponseEntity<AuthResponse> login(LoginRequest req) {
        var u = users.findByEmail(req.email().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bad credentials"));
        if (!encoder.matches(req.password(), u.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bad credentials");
        }
        return issueTokens(u);
    }

    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        String refresh = getCookie(request, refreshCookieName);
        if (refresh == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing refresh token");
        }

        final Jws<Claims> jws;
        try {
            jws = jwt.parse(refresh);
        } catch (JwtException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        String jti = jws.getPayload().getId();
        String email = jws.getPayload().getSubject();

        var record = rts.findByJtiAndRevokedFalse(jti)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token revoked"));

        if (record.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }
        if (!record.getUser().getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token subject mismatch");
        }

        // Rotation: revoke used refresh token and issue a new one
        record.setRevoked(true);
        rts.save(record);

        return issueTokens(record.getUser());
    }

    @Transactional
    public ResponseEntity<Void> logoutByEmail(String email) {
        if (email == null) {
            // anonymous or token expired; still clear cookies (idempotent)
            var accClear = cookies.clear(accessCookieName);
            var refClear = cookies.clear(refreshCookieName);
            return ResponseEntity.noContent()
                    .header(HttpHeaders.SET_COOKIE, accClear.toString())
                    .header(HttpHeaders.SET_COOKIE, refClear.toString())
                    .build();
        }
        var user = users.findByEmail(email).orElse(null);
        if (user != null) {
            rts.revokeAllByUserId(user.getId()); // bulk revoke
        }
        var accClear = cookies.clear(accessCookieName);
        var refClear = cookies.clear(refreshCookieName);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, accClear.toString())
                .header(HttpHeaders.SET_COOKIE, refClear.toString())
                .build();
    }

    /* ==== Helpers ==== */

    private ResponseEntity<AuthResponse> issueTokens(User u) {
        String access = jwt.generateAccessToken(u);

        String jti = UUID.randomUUID().toString();
        String refresh = jwt.generateRefreshToken(u, jti);

        var rt = new RefreshToken();
        rt.setJti(jti);
        rt.setUser(u);
        rt.setExpiresAt(Instant.now().plus(Duration.ofDays(refreshTtlDays)));
        rts.save(rt);

        ResponseCookie accessCookie = (ResponseCookie) cookies.buildAccessCookie(access, Duration.ofMinutes(accessTtlMin));
        ResponseCookie refreshCookie = (ResponseCookie) cookies.buildRefreshCookie(refresh, Duration.ofDays(refreshTtlDays));

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(new AuthResponse(u.getEmail(), u.getRoles()));
    }

    private String getCookie(HttpServletRequest req, String name) {
        if (req.getCookies() == null) return null;
        return Arrays.stream(req.getCookies())
                .filter(c -> name.equals(c.getName()))
                .findFirst()
                .map(Cookie::getValue)
                .orElse(null);
    }
}