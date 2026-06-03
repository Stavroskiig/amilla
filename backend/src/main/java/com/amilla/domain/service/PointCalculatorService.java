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

    private static final int POINTS_EXACT_SCORE = 5;
    private static final int POINTS_SIGN_MATCH = 2;
    private static final int POINTS_QUALIFIER_BONUS = 1;

    private static final int POINTS_LONG_TERM_EARLY = 10;
    private static final int POINTS_LONG_TERM_LATE = 5;

    /**
     * Calculates the points earned for a single match prediction.
     *
     * @param match The settled match entity.
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
            points += POINTS_EXACT_SCORE;
        } 
        // 2. Check Sign Match (Outcome 1X2)
        else if (Integer.signum(actualHome - actualAway) == Integer.signum(predHome - predAway)) {
            points += POINTS_SIGN_MATCH;
        }

        // 3. Check Qualifier Bonus (Knock-out stage only)
        if (!"GROUP".equalsIgnoreCase(match.getMatchStage()) && match.getQualifiedTeam() != null) {
            if (match.getQualifiedTeam().equalsIgnoreCase(prediction.getPredictedQualifier())) {
                points += POINTS_QUALIFIER_BONUS;
            }
        }

        return points;
    }

    /**
     * Calculates the points earned for a long-term champion prediction.
     *
     * @param actualChampion The team that won the tournament.
     * @param prediction The long-term prediction.
     * @param openingMatchKickoff The kickoff time of the tournament's first match.
     * @param groupStageEnd The time when the group stage officially ended.
     * @return Calculated points (10 if submitted before opening match, 5 if submitted during group stage, 0 otherwise).
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

        if (submittedAt.isBefore(openingMatchKickoff)) {
            return POINTS_LONG_TERM_EARLY; // Submitted before kickoff of opening match
        } else if (submittedAt.isBefore(groupStageEnd)) {
            return POINTS_LONG_TERM_LATE;  // Submitted during group stage
        }

        return 0; // Submitted after group stage ends (disallowed, but safety fallback)
    }
}
