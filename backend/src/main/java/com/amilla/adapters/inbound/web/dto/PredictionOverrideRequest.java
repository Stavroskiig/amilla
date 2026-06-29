package com.amilla.adapters.inbound.web.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class PredictionOverrideRequest {
    private UUID userId;
    private String matchId;
    private int homeScore;
    private int awayScore;
    private String qualifier;
    private String predictedQualificationMethod;
}
