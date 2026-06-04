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
    name = "user_rank_history",
    indexes = {
        @Index(name = "idx_user_rank_history_user", columnList = "user_id"),
        @Index(name = "idx_user_rank_history_match", columnList = "match_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRankHistoryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "match_id", nullable = false)
    private String matchId;

    @Column(name = "points", nullable = false)
    private int points;

    @Column(name = "rank", nullable = false)
    private int rank;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
