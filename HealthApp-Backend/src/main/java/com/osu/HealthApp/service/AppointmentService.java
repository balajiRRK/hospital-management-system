package com.osu.HealthApp.service;

import com.osu.HealthApp.dtos.AppointmentRequest;
import com.osu.HealthApp.dtos.AppointmentResponse;
import com.osu.HealthApp.models.Appointment;
import com.osu.HealthApp.models.User;
import com.osu.HealthApp.repo.AppointmentRepository;
import com.osu.HealthApp.repo.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {
    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    public AppointmentResponse createAppointment(AppointmentRequest request) {
        User patient = userRepository.findById(request.getPatientId()).orElseThrow();
        User doctor = userRepository.findById(request.getDoctorId()).orElseThrow();

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        appointment.setReason(request.getReason());

        Appointment saved = appointmentRepository.save(appointment);

        AppointmentResponse response = new AppointmentResponse();
        response.setId(saved.getId());
        response.setPatientName(patient.getEmail());
        response.setDoctorName(doctor.getEmail());
        response.setStartTime(saved.getStartTime());
        response.setEndTime(saved.getEndTime());
        response.setReason(saved.getReason());
        return response;
    }

    public List<AppointmentResponse> getAppointmentsForPatient(Long patientId) {
        return appointmentRepository.findAll().stream()
                .filter(a -> a.getPatient().getId().equals(patientId))
                .map(a -> {
                    AppointmentResponse resp = new AppointmentResponse();
                    resp.setId(a.getId());
                    resp.setPatientName(a.getPatient().getEmail());
                    resp.setDoctorName(a.getDoctor().getEmail());
                    resp.setStartTime(a.getStartTime());
                    resp.setEndTime(a.getEndTime());
                    resp.setReason(a.getReason());
                    return resp;
                }).collect(Collectors.toList());
    }

    // Add more methods as needed (e.g., cancel, update)
}