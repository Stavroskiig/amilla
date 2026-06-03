package com.amilla.adapters.inbound.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PredictionRequest {
    @NotBlank
    private String matchId;

    @Min(0)
    private int predictedHomeScore;

    @Min(0)
    private int predictedAwayScore;

    private String predictedQualifier; // Nullable, only for knockouts
}
