package com.amilla.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Pure Java Domain Model representing a Long Term Prediction (championship winner).
 * Free of JPA or Spring framework annotations to adhere to Hexagonal Architecture.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LongTermPrediction {
    private UUID id;
    private UUID userId;
    private String username;
    private String predictedChampionTeam;
    private Instant submittedAt;
    private Double championOdds;
    private String predictedTopScorer;
    private Double topScorerOdds;
    private Instant topScorerSubmittedAt;
}
