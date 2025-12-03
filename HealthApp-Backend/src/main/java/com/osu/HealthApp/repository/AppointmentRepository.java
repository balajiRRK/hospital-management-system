package com.osu.HealthApp.repository;

import com.osu.HealthApp.models.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientIdOrderByStartTimeDesc(Long patientId);

    List<Appointment> findByDoctorIdOrderByStartTimeDesc(Long doctorId);

    List<Appointment> findByDoctorIdAndStartTimeBetweenOrderByStartTimeDesc(
            Long doctorId, OffsetDateTime startInclusive, OffsetDateTime endExclusive);
}