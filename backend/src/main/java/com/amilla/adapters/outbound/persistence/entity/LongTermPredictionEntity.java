package com.amilla.adapters.outbound.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "long_term_predictions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LongTermPredictionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "predicted_champion_team", nullable = false)
    private String predictedChampionTeam;

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt;
}
