package com.amilla.adapters.outbound.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "predictions",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "match_id"})
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PredictionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "match_id", nullable = false)
    private String matchId;

    @Column(name = "predicted_home_score", nullable = false)
    private int predictedHomeScore;

    @Column(name = "predicted_away_score", nullable = false)
    private int predictedAwayScore;

    @Column(name = "predicted_qualifier")
    private String predictedQualifier;

    @Column(name = "predicted_qualification_method")
    private String predictedQualificationMethod;

    @Column(name = "points_earned", nullable = false)
    private int pointsEarned;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
