package com.osu.HealthApp.Component;

import com.osu.HealthApp.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

/**
 * Reads ACCESS_TOKEN from cookie, validates it, and sets Authentication in the context.
 * This runs before UsernamePasswordAuthenticationFilter.
 */
@Component
@RequiredArgsConstructor
public class JwtCookieAuthFilter extends OncePerRequestFilter {

    private final JwtService jwt;
    private final CustomUserDetailsService uds;

    @Value("${cookie.access-name}")
    private String accessName;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = Arrays.stream(Optional.ofNullable(req.getCookies()).orElse(new Cookie[0]))
                    .filter(c -> accessName.equals(c.getName()))
                    .findFirst().map(Cookie::getValue).orElse(null);

            if (token != null) {
                try {
                    var jws = jwt.parse(token); // throws if invalid/expired
                    String email = jws.getPayload().getSubject();

                    UserDetails ud = uds.loadUserByUsername(email);
                    var auth = new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } catch (io.jsonwebtoken.JwtException ex) {
                    // Invalid/expired token -> leave unauthenticated
                }
            }
        }
        chain.doFilter(req, res);
    }
}