package com.osu.HealthApp.config;

import com.osu.HealthApp.component.JwtCookieAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Arrays;
import java.util.List;

import static org.springframework.security.authorization.AuthorityAuthorizationManager.*;
import static org.springframework.security.authorization.AuthorizationManagers.allOf;
import static org.springframework.security.authorization.AuthorizationManagers.anyOf;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtCookieAuthFilter jwtFilter;

    /**
     * security setup:
     * Stateless JWT auth via HttpOnly cookie
     * CORS for the SPA
     * CSRF disabled (token in cookie, API is stateless JSON)
     * Route/role rules per resource
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, AuthenticationProvider authProvider) throws Exception {
        // Read allowed origins from env, fallback to localhost:3000 for dev
        String originsProp = System.getenv().getOrDefault(
                "CORS_ALLOWED_ORIGINS",
                System.getProperty("CORS_ALLOWED_ORIGINS", "http://localhost:3000")
        );
        List<String> allowedOrigins = Arrays.stream(originsProp.split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList();

        http
                // Use stateless sessions so JWT only
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // CORS for browser
                .cors(cors -> cors.configurationSource(req -> {
                    var c = new CorsConfiguration();
                    c.setAllowedOrigins(allowedOrigins);
                    c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
                    c.setAllowedHeaders(List.of("*"));
                    c.setExposedHeaders(List.of("Set-Cookie"));
                    c.setAllowCredentials(true);
                    return c;
                }))

                // No CSRF for stateless JSON API
                .csrf(AbstractHttpConfigurer::disable)

                // Return 401 when unauthenticated user hits protected endpoint
                .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))

                // authorization rules
                .authorizeHttpRequests(auth -> auth
                        // allow CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // public auth/error endpoints
                        .requestMatchers("/error").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        // public: list of doctors (used by scheduler)
                        .requestMatchers(HttpMethod.GET, "/api/doctor/doctors").permitAll()

                        // public: doctor availability (wildcard segment)
                        .requestMatchers(HttpMethod.GET, "/api/appointments/doctor/*/availability").permitAll()

                        // logged-in user profile
                        .requestMatchers("/api/me").authenticated()

                        // Staff/admin areas (require both role + staff context)
                        .requestMatchers("/api/admin/**")
                        .access(allOf(hasRole("ADMIN"), hasAuthority("CONTEXT_STAFF")))
                        .requestMatchers("/api/doctor/**")
                        .access(allOf(hasAnyRole("DOCTOR", "ADMIN"), hasAuthority("CONTEXT_STAFF")))
                        .requestMatchers("/api/nurse/**")
                        .access(allOf(hasAnyRole("NURSE", "ADMIN"), hasAuthority("CONTEXT_STAFF")))

                        // patient endpoints: either patient+patient-context OR admin+staff-context
                        .requestMatchers("/api/patient/**")
                        .access(anyOf(
                                allOf(hasRole("PATIENT"), hasAuthority("CONTEXT_PATIENT")),
                                allOf(hasRole("ADMIN"), hasAuthority("CONTEXT_STAFF"))
                        ))

                        // Appointments CRUD: patients (patient context) or staff (doctor/nurse context)
                        .requestMatchers(HttpMethod.POST, "/api/appointments/**")
                        .access(anyOf(
                                allOf(hasAnyRole("DOCTOR", "NURSE"), hasAuthority("CONTEXT_STAFF")),
                                allOf(hasRole("PATIENT"), hasAuthority("CONTEXT_PATIENT"))
                        ))
                        .requestMatchers(HttpMethod.PUT, "/api/appointments/**")
                        .access(anyOf(
                                allOf(hasAnyRole("DOCTOR", "NURSE"), hasAuthority("CONTEXT_STAFF")),
                                allOf(hasRole("PATIENT"), hasAuthority("CONTEXT_PATIENT"))
                        ))
                        .requestMatchers(HttpMethod.PATCH, "/api/appointments/**")
                        .access(anyOf(
                                allOf(hasAnyRole("DOCTOR", "NURSE"), hasAuthority("CONTEXT_STAFF")),
                                allOf(hasRole("PATIENT"), hasAuthority("CONTEXT_PATIENT"))
                        ))
                        .requestMatchers(HttpMethod.DELETE, "/api/appointments/**")
                        .access(anyOf(
                                allOf(hasAnyRole("DOCTOR", "NURSE"), hasAuthority("CONTEXT_STAFF")),
                                allOf(hasRole("PATIENT"), hasAuthority("CONTEXT_PATIENT"))
                        ))

                        // Reads: doctor lists (staff) and patient reads (staff or self)
                        .requestMatchers(HttpMethod.GET, "/api/appointments/doctor/**")
                        .access(allOf(hasAnyRole("DOCTOR", "NURSE", "ADMIN"), hasAuthority("CONTEXT_STAFF")))
                        .requestMatchers(HttpMethod.GET, "/api/appointments/patient/**")
                        .access(anyOf(
                                allOf(hasAnyRole("DOCTOR", "NURSE", "ADMIN"), hasAuthority("CONTEXT_STAFF")),
                                allOf(hasRole("PATIENT"), hasAuthority("CONTEXT_PATIENT"))
                        ))

                        // everything else requires authentication
                        .anyRequest().authenticated()
                )

                // convert JWT cookie to Authentication before UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)

                // disable form/basic auth for API only
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)

                // plug in our AuthenticationProvider
                .authenticationProvider(authProvider);

        return http.build();
    }

    /**
     * Wire a DAO-based AuthenticationProvider with our UDS + encoder.
     */
    @Bean
    public AuthenticationProvider authenticationProvider(PasswordEncoder encoder, UserDetailsService uds) {
        var provider = new DaoAuthenticationProvider(uds);
        provider.setPasswordEncoder(encoder);
        return provider;
    }

    /** Expose AuthenticationManager for injection where needed. */
    @Bean
    public AuthenticationManager authenticationManager(
            org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration cfg
    ) throws Exception {
        return cfg.getAuthenticationManager();
    }
}