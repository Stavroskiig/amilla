package com.amilla.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Pure Java Domain Model representing User Rank History.
 * Free of JPA or Spring annotations to adhere to Hexagonal Architecture.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRankHistory {
    private UUID id;
    private UUID userId;
    private String matchId;
    private int points;
    private int rank;
    private Instant createdAt;
}
