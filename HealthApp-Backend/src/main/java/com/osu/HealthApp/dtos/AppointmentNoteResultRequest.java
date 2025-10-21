package com.osu.HealthApp.dtos;

import jakarta.validation.constraints.NotBlank;

/** Appointment note and result submission payload, requires only the ID of the appointment to act upon */
public record AppointmentNoteResultRequest(
        @NotBlank Long appointmentId,
		String contents
) {}