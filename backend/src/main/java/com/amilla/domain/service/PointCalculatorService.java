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

        int points = 0;

        int actualHome = match.getHomeScore90();
        int actualAway = match.getAwayScore90();
        int predHome = prediction.getPredictedHomeScore();
        int predAway = prediction.getPredictedAwayScore();

        // 1. Check Exact Score Match
        if (actualHome == predHome && actualAway == predAway) {
            double odds = getExactScoreOdds(match, predHome, predAway);
            points += (int) Math.round(ODDS_TO_POINTS_MULTIPLIER * odds);
        }
        // 2. Check Sign Match (Outcome 1X2)
        else if (Integer.signum(actualHome - actualAway) == Integer.signum(predHome - predAway)) {
            double odds = getSignOdds(match, actualHome - actualAway);
            points += (int) Math.round(ODDS_TO_POINTS_MULTIPLIER * odds);
        }

        // 3. Check Qualifier Bonus (Knock-out stage only)
        if (!"GROUP".equalsIgnoreCase(match.getMatchStage()) && match.getQualifiedTeam() != null) {
            if (match.getQualifiedTeam().equalsIgnoreCase(prediction.getPredictedQualifier())) {
                double advanceOdds = getAdvanceOdds(match, prediction.getPredictedQualifier());
                points += (int) Math.round(ODDS_TO_POINTS_MULTIPLIER * advanceOdds);
            }
        }

        return points;
    }

    private double getExactScoreOdds(Match match, int homeScore, int awayScore) {
        if (match.getExactScoreOddsJson() == null || match.getExactScoreOddsJson().isEmpty()) {
            return 15.0; // Realistic Fallback for rare scores
        }
        try {
            // Simple parsing to avoid adding Jackson dependency if it's not strictly
            // necessary in domain
            // format is roughly {"1-0":8.5,"0-1":12.0}
            String key = "\"" + homeScore + "-" + awayScore + "\":";
            int idx = match.getExactScoreOddsJson().indexOf(key);
            if (idx != -1) {
                int start = idx + key.length();
                int end = match.getExactScoreOddsJson().indexOf(",", start);
                if (end == -1)
                    end = match.getExactScoreOddsJson().indexOf("}", start);
                if (end != -1) {
                    String valueStr = match.getExactScoreOddsJson().substring(start, end).replace("\"", "").trim();
                    return Double.parseDouble(valueStr);
                }
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

    private double getAdvanceOdds(Match match, String predictedQualifier) {
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
