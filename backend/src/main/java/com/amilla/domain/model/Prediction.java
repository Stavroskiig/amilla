package com.amilla.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Pure Java Domain Model representing a Match Prediction.
 * Free of JPA or Spring framework annotations to adhere to Hexagonal Architecture.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Prediction {
    private UUID id;
    private UUID userId;
    private String matchId;
    private int predictedHomeScore;
    private int predictedAwayScore;
    private String predictedQualifier; // Only for Knockout stages
    private int pointsEarned;
    private Instant createdAt;
    private Instant updatedAt;
    private String username;
}
