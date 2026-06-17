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

    @Column(name = "tv_channel")
    private String tvChannel;

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

    @Column(name = "home_odds")
    private Double homeOdds;

    @Column(name = "draw_odds")
    private Double drawOdds;

    @Column(name = "away_odds")
    private Double awayOdds;

    @Column(name = "home_advance_odds")
    private Double homeAdvanceOdds;

    @Column(name = "away_advance_odds")
    private Double awayAdvanceOdds;

    @Column(name = "exact_score_odds_json", columnDefinition = "TEXT")
    private String exactScoreOddsJson;

    @Column(name = "odds_last_updated_at")
    private Instant oddsLastUpdatedAt;
}
