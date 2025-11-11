package com.osu.HealthApp.service;

import com.osu.HealthApp.models.HealthMetric;
import com.osu.HealthApp.models.User;
import com.osu.HealthApp.dtos.HealthMetricDto;
import com.osu.HealthApp.repo.HealthMetricRepository;
import com.osu.HealthApp.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;

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
}
