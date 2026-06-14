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

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "predicted_champion_team")
    private String predictedChampionTeam;

    @Column(name = "submitted_at")
    private Instant submittedAt;

    @Column(name = "champion_odds")
    private Double championOdds;

    @Column(name = "predicted_top_scorer")
    private String predictedTopScorer;

    @Column(name = "top_scorer_odds")
    private Double topScorerOdds;

    @Column(name = "top_scorer_submitted_at")
    private Instant topScorerSubmittedAt;
}
