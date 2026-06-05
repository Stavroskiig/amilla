package com.amilla.adapters.outbound.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String role; // "ROLE_USER", "ROLE_ADMIN"

    @Column(name = "total_points", nullable = false)
    private int totalPoints;

    @Column(name = "avatar")
    private String avatar;

    @Column(name = "previous_rank")
    private Integer previousRank;

    @Builder.Default
    @Column(name = "current_streak")
    private Integer currentStreak = 0;

    @Builder.Default
    @Column(name = "longest_streak")
    private Integer longestStreak = 0;

    @Builder.Default
    @Column(name = "exact_hits")
    private Integer exactHits = 0;

    @Builder.Default
    @Column(name = "correct_outcomes")
    private Integer correctOutcomes = 0;
}
