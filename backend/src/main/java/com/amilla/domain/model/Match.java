package com.amilla.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Pure Java Domain Model representing a Match.
 * Free of JPA or Spring framework annotations to adhere to Hexagonal Architecture.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Match {
    private String id;
    private String homeTeam;
    private String awayTeam;
    private String matchStage; // e.g. "GROUP", "ROUND_OF_16", "QUARTERS", "SEMIS", "FINAL"
    private Instant kickoffTime;
    private Integer homeScore90;
    private Integer awayScore90;
    private String qualifiedTeam; // Only populated for Knockout matches
    private String status; // e.g. "SCHEDULED", "LIVE", "FINISHED"
}
