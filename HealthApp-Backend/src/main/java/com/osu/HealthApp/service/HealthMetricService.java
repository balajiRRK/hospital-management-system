package com.osu.HealthApp.service;

import com.osu.HealthApp.models.HealthMetric;
import com.osu.HealthApp.models.User;

import com.osu.HealthApp.dtos.HealthMetricDto;
import com.osu.HealthApp.repo.HealthMetricRepository;
import com.osu.HealthApp.repo.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
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
    public HealthMetric addHealthMetricForUser(Long userId, HealthMetricDto metricDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        HealthMetric newMetric = new HealthMetric();
        newMetric.setUser(user);
        newMetric.setWeight(metricDto.getWeight());
        newMetric.setHeight(metricDto.getHeight());

        // Calculate and set BMI
        if (metricDto.getHeight() != null && metricDto.getHeight() > 0 && metricDto.getWeight() != null) {
            BigDecimal bmi = BigDecimal.valueOf(metricDto.getWeight() / (metricDto.getHeight() * metricDto.getHeight()));
            newMetric.setBmi(bmi.setScale(2, RoundingMode.HALF_UP).doubleValue());
        }

        return healthMetricRepository.save(newMetric);
    }
}