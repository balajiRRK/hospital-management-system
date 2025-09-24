package com.osu.HealthApp.repo;

import com.osu.HealthApp.models.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByDoctorIdAndStartTimeBetween(
            Long doctorId, OffsetDateTime startInclusive, OffsetDateTime endExclusive
    );
}