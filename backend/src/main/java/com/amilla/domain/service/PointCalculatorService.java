package com.amilla.domain.service;

import com.amilla.domain.model.Match;
import com.amilla.domain.model.Prediction;
import com.amilla.domain.model.LongTermPrediction;

import java.time.Instant;

/**
 * Pure Java Service for calculating prediction scores.
 * Adheres to Hexagonal Architecture (no framework annotations).
 */
public class PointCalculatorService {

    private static final int ODDS_TO_POINTS_MULTIPLIER = 10;

    /**
     * Calculates the points earned for a single match prediction.
     *
     * @param match      The settled match entity.
     * @param prediction The user's prediction.
     * @return Calculated points.
     */
    public int calculateMatchPoints(Match match, Prediction prediction) {
        if (match.getHomeScore90() == null || match.getAwayScore90() == null) {
            return 0;
        }

        int actualHome = match.getHomeScore90();
        int actualAway = match.getAwayScore90();
        int predHome = prediction.getPredictedHomeScore();
        int predAway = prediction.getPredictedAwayScore();

        boolean isKnockout = !"GROUP".equalsIgnoreCase(match.getMatchStage());
        boolean gotExactScore = actualHome == predHome && actualAway == predAway;
        boolean gotSign = Integer.signum(actualHome - actualAway) == Integer.signum(predHome - predAway);
        
        boolean predictedDraw = predHome == predAway;
        boolean correctlyPredictedQualifierTeam = isKnockout && match.getQualifiedTeam() != null && match.getQualifiedTeam().equalsIgnoreCase(prediction.getPredictedQualifier());
        boolean correctlyPredictedMethod = isKnockout && match.getQualificationMethod() != null && match.getQualificationMethod().equalsIgnoreCase(prediction.getPredictedQualificationMethod());

        int scorePoints = 0;
        int advancePoints = 0;

        if (gotExactScore) {
            double odds = getExactScoreOdds(match, predHome, predAway);
            scorePoints = (int) Math.round(ODDS_TO_POINTS_MULTIPLIER * odds);
        } else if (gotSign) {
            double odds = getSignOdds(match, actualHome - actualAway);
            scorePoints = (int) Math.round(ODDS_TO_POINTS_MULTIPLIER * odds);
        }

        if (isKnockout && correctlyPredictedQualifierTeam) {
            boolean isOldSystem = match.getQualificationMethod() == null;

            if (isOldSystem) {
                if (predictedDraw) {
                    double advanceOdds = getAdvanceOddsWithMethod(match, prediction.getPredictedQualifier(), null);
                    advancePoints = (int) Math.round(ODDS_TO_POINTS_MULTIPLIER * advanceOdds);
                } else {
                    if (scorePoints == 0) {
                        double advanceOdds = getAdvanceOddsWithMethod(match, prediction.getPredictedQualifier(), null);
                        advancePoints = (int) Math.round(ODDS_TO_POINTS_MULTIPLIER * advanceOdds);
                    }
                }
            } else {
                if (predictedDraw) {
                    // If they predicted a draw, they MUST get both the advancing team and the method right.
                    if (correctlyPredictedMethod) {
                        double advanceOdds = getAdvanceOddsWithMethod(match, prediction.getPredictedQualifier(), prediction.getPredictedQualificationMethod());
                        advancePoints = (int) Math.round(ODDS_TO_POINTS_MULTIPLIER * advanceOdds);
                    }
                } else {
                    // They predicted a 90-min win (implies REGULAR_TIME). They also get regular time advance points!
                    if (correctlyPredictedMethod) {
                        double advanceOdds = getAdvanceOddsWithMethod(match, prediction.getPredictedQualifier(), prediction.getPredictedQualificationMethod());
                        advancePoints = (int) Math.round(ODDS_TO_POINTS_MULTIPLIER * advanceOdds);
                    }
                }
            }
        }

        return scorePoints + advancePoints;
    }

    private static final com.fasterxml.jackson.databind.ObjectMapper MAPPER = new com.fasterxml.jackson.databind.ObjectMapper();

    private double getExactScoreOdds(Match match, int homeScore, int awayScore) {
        if (match.getExactScoreOddsJson() == null || match.getExactScoreOddsJson().isEmpty()) {
            return 15.0; // Realistic Fallback for rare scores
        }
        try {
            java.util.Map<String, Double> oddsMap = MAPPER.readValue(
                    match.getExactScoreOddsJson(),
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Double>>() {}
            );
            String key = homeScore + "-" + awayScore;
            if (oddsMap.containsKey(key)) {
                return oddsMap.get(key);
            }
        } catch (Exception e) {
            // Fallback
        }
        return 1000.00; // Realistic Fallback for rare scores
    }

    private double getSignOdds(Match match, int goalDiff) {
        if (goalDiff > 0 && match.getHomeOdds() != null) {
            return match.getHomeOdds();
        } else if (goalDiff == 0 && match.getDrawOdds() != null) {
            return match.getDrawOdds();
        } else if (goalDiff < 0 && match.getAwayOdds() != null) {
            return match.getAwayOdds();
        }
        return 2.0; // Fallback
    }

    private double getAdvanceOddsWithMethod(Match match, String predictedQualifier, String method) {
        if (match.getQualifierOddsJson() != null && !match.getQualifierOddsJson().trim().isEmpty()) {
            try {
                java.util.Map<String, Double> oddsMap = MAPPER.readValue(
                        match.getQualifierOddsJson(),
                        new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Double>>() {}
                );
                String prefix = predictedQualifier.equalsIgnoreCase(match.getHomeTeam()) ? "HOME_" : "AWAY_";
                String key = prefix + method; // e.g. "HOME_EXTRA_TIME"
                if (oddsMap.containsKey(key)) {
                    return oddsMap.get(key);
                }
            } catch (Exception e) {
                // Fallback
            }
        }

        // Legacy fallback
        if (predictedQualifier != null && predictedQualifier.equalsIgnoreCase(match.getHomeTeam()) && match.getHomeAdvanceOdds() != null) {
            return match.getHomeAdvanceOdds();
        } else if (predictedQualifier != null && predictedQualifier.equalsIgnoreCase(match.getAwayTeam()) && match.getAwayAdvanceOdds() != null) {
            return match.getAwayAdvanceOdds();
        }
        return 1.0; // Fallback
    }

    /**
     * Calculates the points earned for a long-term champion prediction.
     *
     * @param actualChampion      The team that won the tournament.
     * @param prediction          The long-term prediction.
     * @param openingMatchKickoff The kickoff time of the tournament's first match.
     * @param groupStageEnd       The time when the group stage officially ended.
     * @return Calculated points (10 if submitted before opening match, 5 if
     *         submitted during group stage, 0 otherwise).
     */
    public int calculateLongTermPoints(String actualChampion, LongTermPrediction prediction,
            Instant openingMatchKickoff, Instant groupStageEnd) {
        if (actualChampion == null || prediction == null) {
            return 0;
        }

        if (!actualChampion.equalsIgnoreCase(prediction.getPredictedChampionTeam())) {
            return 0;
        }

        Instant submittedAt = prediction.getSubmittedAt();
        if (submittedAt == null) {
            return 0;
        }

        double odds = prediction.getChampionOdds() != null ? prediction.getChampionOdds() : 1.0; // Fallback

        if (submittedAt.isBefore(openingMatchKickoff)) {
            return (int) Math.round(20 * odds); // Submitted before kickoff of opening match
        } else if (submittedAt.isBefore(groupStageEnd)) {
            return (int) Math.round(10 * odds); // Submitted during group stage
        }

        return 0; // Submitted after group stage ends (disallowed, but safety fallback)
    }

}
