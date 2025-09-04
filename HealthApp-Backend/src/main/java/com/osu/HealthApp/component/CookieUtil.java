package com.osu.HealthApp.Component;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpCookie;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Builds HttpOnly, Secure cookies with SameSite policy.
 * Access cookie is for API calls; refresh cookie is path-scoped to /api/auth.
 */
@Component
@RequiredArgsConstructor
public class CookieUtil {
    @Value("${cookie.domain}") private String domain;
    @Value("${cookie.secure}") private boolean secure;
    @Value("${cookie.same-site}") private String sameSite; // Strict | Lax | None
    @Value("${cookie.access-name}") private String accessName;
    @Value("${cookie.refresh-name}") private String refreshName;

    public HttpCookie buildAccessCookie(String token, Duration maxAge) {
        return ResponseCookie.from(accessName, token)
                .httpOnly(true).secure(secure).domain(domain)
                .path("/")
                .maxAge(maxAge)
                .sameSite(sameSite)
                .build();
    }

    public HttpCookie buildRefreshCookie(String token, Duration maxAge) {
        return ResponseCookie.from(refreshName, token)
                .httpOnly(true).secure(secure).domain(domain)
                .path("/api/auth") // scope refresh cookie to auth routes only
                .maxAge(maxAge)
                .sameSite(sameSite)
                .build();
    }

    public HttpCookie clear(String name) {
        return ResponseCookie.from(name, "")
                .maxAge(Duration.ZERO)
                .path("/")
                .domain(domain)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .build();
    }
}