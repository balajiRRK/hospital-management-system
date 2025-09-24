package com.osu.HealthApp.repo;

import com.osu.HealthApp.models.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    // Add custom queries if needed
}