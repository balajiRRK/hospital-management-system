package com.osu.HealthApp.component;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Central place to create/clear auth cookies.
 * ACCESS_TOKEN is sent for all API calls; REFRESH_TOKEN is scoped to /api/auth.
 */
@Component
public class CookieUtil {

    @Value("${cookie.domain}")       private String domain;       // localhost
    @Value("${cookie.secure}")       private boolean secure;      // true in prod (HTTPS)
    @Value("${cookie.same-site}")    private String sameSite;     // Lax || Strict || None
    @Value("${cookie.access-name}")  private String accessName;   // ACCESS_TOKEN
    @Value("${cookie.refresh-name}") private String refreshName;  // REFRESH_TOKEN

    public ResponseCookie buildAccessCookie(String jwt, Duration maxAge) {
        return base(accessName, jwt, maxAge).path("/").build();
    }

    public ResponseCookie buildRefreshCookie(String jwt, Duration maxAge) {
        // refresh only used on /api/auth endpoints
        return base(refreshName, jwt, maxAge).path("/api/auth").build();
    }

    public ResponseCookie clear(String name) {
        return base(name, "", Duration.ZERO).path("/").build();
    }

    private ResponseCookie.ResponseCookieBuilder base(String name, String value, Duration maxAge) {
        // SameSite=None requires secure=true in modern browsers.
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .domain(domain)
                .sameSite(sameSite)
                .maxAge(maxAge);
    }
}