package com.osu.HealthApp.component;

import com.osu.HealthApp.service.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.stream.Stream;

/**
 * Reads JWT from an HttpOnly cookie and, if valid, sets Authentication in the SecurityContext.
 * Missing/invalid token -> continue as anonymous, DO NOT short-circuit with 403.
 *  This filter is only responsible for authentication (attaching a user to the request if possible).
 *  Authorization (who is allowed to access what) is handled later by Spring Security rules in SecurityConfig.
 *  Returning 403 here would block even public endpoints which we don't want.
 *   - behavior:
 *           If token is valid → set Authentication.
 *           If token is missing/invalid → leave user anonymous.
 *           Then let Spring Security decide:
 *           Protected endpoint + anonymous = 401 Unauthorized.
 *           Authenticated but not allowed = 403 Forbidden.
 */
@Component
@RequiredArgsConstructor
public class JwtCookieAuthFilter extends OncePerRequestFilter {

    private final JwtService jwt;
    private final CustomUserDetailsService uds;

    @Value("${cookie.access-name:AUTH}")
    private String accessName;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        // If already authenticated, pass through
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            String token = readTokenFromCookie(req);

            if (token != null && !token.isBlank()) {
                try {
                    var jws = jwt.parse(token); // throws if invalid/expired
                    String email = jws.getPayload().getSubject();

                    // Load authorities from user
                    UserDetails ud = uds.loadUserByUsername(email);

                    Object ctx = jws.getPayload().get("context");
                    Stream<GrantedAuthority> ctxAuthStream =
                            (ctx instanceof String s && !s.isBlank())
                                    ? Stream.of(new SimpleGrantedAuthority("CONTEXT_" + s))
                                    : Stream.empty();

                    Collection<? extends GrantedAuthority> authorities =
                            Stream.concat(ud.getAuthorities().stream(), ctxAuthStream).toList();

                    var authentication = new UsernamePasswordAuthenticationToken(ud, null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } catch (Exception ex) {
                    // Invalid or expired token => clear context and continue as anonymous
                    SecurityContextHolder.clearContext();
                }
            }
        }
        chain.doFilter(req, res);
    }

    private String readTokenFromCookie(HttpServletRequest req) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) return null;
        for (Cookie c : cookies) {
            if (accessName.equals(c.getName())) {
                return c.getValue();
            }
        }
        return null;
    }
}