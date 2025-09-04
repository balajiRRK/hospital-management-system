package com.osu.HealthApp.service;

import com.osu.HealthApp.component.CookieUtil;
import com.osu.HealthApp.component.JwtService;
import com.osu.HealthApp.dtos.AuthResponse;
import com.osu.HealthApp.dtos.LoginRequest;
import com.osu.HealthApp.dtos.RegisterRequest;
import com.osu.HealthApp.models.RefreshToken;
import com.osu.HealthApp.models.Role;
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

    /** Register: everyone starts as PATIENT (role is NOT accepted from client). */
    public ResponseEntity<AuthResponse> register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();

        users.findByEmail(email).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        });

        var u = new User();
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(req.password()));
        u.setEnabled(true);
        u.getRoles().add(Role.PATIENT); // safe default
        users.save(u);

        return issueTokens(u, HttpStatus.CREATED);
    }

    public ResponseEntity<AuthResponse> login(LoginRequest req) {
        String email = req.email().trim().toLowerCase();

        var u = users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bad credentials"));
        if (!encoder.matches(req.password(), u.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Bad credentials");
        }
        return issueTokens(u, HttpStatus.OK);
    }

    /** Rotate refresh token and issue new cookies. */
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        String refresh = getCookie(request, refreshCookieName);
        if (refresh == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing refresh token");

        final Jws<Claims> jws;
        try {
            jws = jwt.parse(refresh);
        } catch (JwtException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        String jti = jws.getPayload().getId();
        String email = jws.getPayload().getSubject();

        var record = rts.findByJtiAndRevokedFalse(jti)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token revoked/unknown"));

        if (record.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }
        if (!record.getUser().getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token subject mismatch");
        }

        // Rotation
        record.setRevoked(true);
        rts.save(record);

        return issueTokens(record.getUser(), HttpStatus.OK);
    }

    /** Logout: revoke all refresh tokens & clear cookies. */
    @Transactional
    public ResponseEntity<Void> logoutByEmail(String email) {
        if (email != null) {
            users.findByEmail(email).ifPresent(u -> rts.revokeAllByUserId(u.getId()));
        }
        var accClear = cookies.clear(accessCookieName);
        var refClear = cookies.clear(refreshCookieName);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, accClear.toString())
                .header(HttpHeaders.SET_COOKIE, refClear.toString())
                .build();
    }

    private ResponseEntity<AuthResponse> issueTokens(User u, HttpStatus status) {
        String access = jwt.generateAccessToken(u);
        String jti = UUID.randomUUID().toString();
        String refresh = jwt.generateRefreshToken(u, jti);

        var rt = new RefreshToken();
        rt.setJti(jti);
        rt.setUser(u);
        rt.setExpiresAt(Instant.now().plus(Duration.ofDays(refreshTtlDays)));
        rts.save(rt);

        ResponseCookie accessCookie = cookies.buildAccessCookie(access, Duration.ofMinutes(accessTtlMin));
        ResponseCookie refreshCookie = cookies.buildRefreshCookie(refresh, Duration.ofDays(refreshTtlDays));

        return ResponseEntity.status(status)
                .header(HttpHeaders.SET_COOKIE, accessCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(new AuthResponse(true, u.getRoles()));
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