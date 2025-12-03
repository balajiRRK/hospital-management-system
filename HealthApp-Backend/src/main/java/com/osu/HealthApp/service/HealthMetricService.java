package com.osu.HealthApp.service;

import com.osu.HealthApp.models.HealthMetric;
import com.osu.HealthApp.models.User;
import com.osu.HealthApp.dtos.HealthMetricDto;
import com.osu.HealthApp.repository.HealthMetricRepository;
import com.osu.HealthApp.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/** Health metric creation with guardrails for BMI calculation. */
@Service
public class HealthMetricService {

    private final HealthMetricRepository healthMetricRepository;
    private final UserRepository userRepository;

    public HealthMetricService(HealthMetricRepository healthMetricRepository, UserRepository userRepository) {
        this.healthMetricRepository = healthMetricRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public HealthMetric addHealthMetricForUser(Long userId, HealthMetricDto dto) {
        enforceSelfOrStaff(userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found"));

        BigDecimal w = dto.weight();
        BigDecimal h = dto.height();

        // in case validation didn’t run
        if (w == null || h == null || w.signum() <= 0 || h.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "weight and height must be > 0");
        }

        BigDecimal bmi = w.divide(h.multiply(h), 2, RoundingMode.HALF_UP);

        HealthMetric m = new HealthMetric();
        m.setUser(user);
        m.setWeight(w.doubleValue());
        m.setHeight(h.doubleValue());
        m.setBmi(bmi.doubleValue());

        return healthMetricRepository.save(m);
    }

    @Transactional(readOnly = true)
    public List<HealthMetric> getHealthMetricsForUser(Long userId) {
        enforceSelfOrStaff(userId);

        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "user not found");
        }
        return healthMetricRepository.findByUserIdOrderByRecordedAtDesc(userId);
    }

    private void enforceSelfOrStaff(Long userId) {
        if (isStaff()) {
            return;
        }
        if (!getCurrentUserIdOrThrow().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot access another user's metrics");
        }
    }

    private boolean isStaff() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("CONTEXT_STAFF"::equals);
    }

    private Long getCurrentUserIdOrThrow() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        return userRepository.findByEmail(auth.getName())
                .map(User::getId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
