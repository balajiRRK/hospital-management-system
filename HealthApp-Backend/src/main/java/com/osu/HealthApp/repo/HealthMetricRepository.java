package com.osu.HealthApp.repo;

import com.osu.HealthApp.models.HealthMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HealthMetricRepository extends JpaRepository<HealthMetric, Long> {

}
