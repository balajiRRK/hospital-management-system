package com.osu.HealthApp.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record HealthMetricDto(
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal weight,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal height
) {}
