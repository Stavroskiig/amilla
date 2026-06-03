package com.amilla.adapters.outbound.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "matches")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchEntity {

    @Id
    private String id;

    @Column(name = "home_team", nullable = false)
    private String homeTeam;

    @Column(name = "away_team", nullable = false)
    private String awayTeam;

    @Column(name = "match_stage", nullable = false)
    private String matchStage;

    @Column(name = "kickoff_time", nullable = false)
    private Instant kickoffTime;

    @Column(name = "home_score_90")
    private Integer homeScore90;

    @Column(name = "away_score_90")
    private Integer awayScore90;

    @Column(name = "qualified_team")
    private String qualifiedTeam;

    @Column(nullable = false)
    private String status; // "SCHEDULED", "LIVE", "FINISHED"
}
