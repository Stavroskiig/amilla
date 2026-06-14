package com.amilla.adapters.inbound.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
public class GlobalStatsDto {

    // 1. Community Pulse
    private Map<String, Double> championDistribution;
    private String mostCommonScoreline;

    // 2. Match Superlatives
    private MatchStatDto mostPredictableMatch;
    private MatchStatDto biggestUpset;

    // 3. Hall of Fame
    private UserStatDto theOracle; // Highest exact hit rate
    private UserStatDto mrConsistent; // Longest streak
    private UserStatDto highestScorer; // Highest points

    // 4. Global Averages
    private Double averagePointsPerPrediction;
    private Long totalExactScores;
    private Long totalCorrectResults;
    private Long totalMisses;
    
    // 5. Prediction Matrix
    private PredictionMatrixDto predictionMatrix;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchStatDto {
        private String matchId;
        private String homeTeam;
        private String awayTeam;
        private Integer homeScore;
        private Integer awayScore;
        private Double averagePoints;
        private Integer exactPredictions;
        private Integer correctResultPredictions;
        private Integer totalPredictions;
        private Double correctPercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserStatDto {
        private String username;
        private String avatar;
        private String statValue; // e.g. "45% exact hits", "12 predictions in a row"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictionMatrixDto {
        private List<PlayerHeaderDto> players;
        private List<MatchRowDto> matches;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlayerHeaderDto {
        private String id;
        private String username;
        private String avatar;
        private Integer totalPoints;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchRowDto {
        private String matchId;
        private String homeTeam;
        private String awayTeam;
        private Integer homeScore;
        private Integer awayScore;
        private String matchStage;
        private String status;
        private java.time.Instant kickoffTime;
        // Map of userId -> PredictionCellDto
        private Map<String, PredictionCellDto> predictions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictionCellDto {
        private Integer homeScore;
        private Integer awayScore;
        private Integer pointsEarned;
    }
}
