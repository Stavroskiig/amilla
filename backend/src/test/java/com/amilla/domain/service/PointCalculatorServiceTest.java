package com.amilla.domain.service;

import com.amilla.domain.model.LongTermPrediction;
import com.amilla.domain.model.Match;
import com.amilla.domain.model.Prediction;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class PointCalculatorServiceTest {

    private final PointCalculatorService calculator = new PointCalculatorService();

    @Test
    public void testExactScoreMatch() {
        Match match = Match.builder()
                .homeScore90(2)
                .awayScore90(1)
                .matchStage("GROUP")
                .build();

        Prediction prediction = Prediction.builder()
                .predictedHomeScore(2)
                .predictedAwayScore(1)
                .build();

        int points = calculator.calculateMatchPoints(match, prediction);
        assertEquals(5, points, "Exact score match should yield 5 points");
    }

    @Test
    public void testOutcomeMatchSignOnly() {
        Match match = Match.builder()
                .homeScore90(3)
                .awayScore90(1)
                .matchStage("GROUP")
                .build();

        Prediction prediction = Prediction.builder()
                .predictedHomeScore(1)
                .predictedAwayScore(0) // Both are Home team wins, but different scores
                .build();

        int points = calculator.calculateMatchPoints(match, prediction);
        assertEquals(2, points, "Outcome sign match only should yield 2 points");
    }

    @Test
    public void testNoPoints() {
        Match match = Match.builder()
                .homeScore90(3)
                .awayScore90(1)
                .matchStage("GROUP")
                .build();

        Prediction prediction = Prediction.builder()
                .predictedHomeScore(0)
                .predictedAwayScore(2) // Predicted Away win, actual was Home win
                .build();

        int points = calculator.calculateMatchPoints(match, prediction);
        assertEquals(0, points, "Wrong prediction sign should yield 0 points");
    }

    @Test
    public void testKnockoutQualifierBonus() {
        Match match = Match.builder()
                .homeScore90(1)
                .awayScore90(1)
                .matchStage("ROUND_OF_16")
                .qualifiedTeam("Argentina")
                .build();

        // User predicted 1-1 and Argentina qualifying (exact score + qualifier)
        Prediction prediction1 = Prediction.builder()
                .predictedHomeScore(1)
                .predictedAwayScore(1)
                .predictedQualifier("Argentina")
                .build();

        int points1 = calculator.calculateMatchPoints(match, prediction1);
        assertEquals(6, points1, "Exact score (5) + qualifier bonus (1) should yield 6 points");

        // User predicted 2-2 and France qualifying (sign match + wrong qualifier)
        Prediction prediction2 = Prediction.builder()
                .predictedHomeScore(2)
                .predictedAwayScore(2)
                .predictedQualifier("France")
                .build();

        int points2 = calculator.calculateMatchPoints(match, prediction2);
        assertEquals(2, points2, "Sign match (2) + wrong qualifier (0) should yield 2 points");
    }

    @Test
    public void testLongTermPredictionEarlyBird() {
        Instant openingMatch = Instant.now().plus(2, ChronoUnit.DAYS);
        Instant groupStageEnd = Instant.now().plus(14, ChronoUnit.DAYS);

        LongTermPrediction prediction = LongTermPrediction.builder()
                .predictedChampionTeam("Brazil")
                .submittedAt(Instant.now()) // Submitted before opening match
                .build();

        int points = calculator.calculateLongTermPoints("Brazil", prediction, openingMatch, groupStageEnd);
        assertEquals(10, points, "Early bird long term prediction should yield 10 points");
    }

    @Test
    public void testLongTermPredictionLate() {
        Instant openingMatch = Instant.now().minus(1, ChronoUnit.DAYS); // Already started
        Instant groupStageEnd = Instant.now().plus(10, ChronoUnit.DAYS);

        LongTermPrediction prediction = LongTermPrediction.builder()
                .predictedChampionTeam("Brazil")
                .submittedAt(Instant.now()) // Submitted after kickoff but before group stage end
                .build();

        int points = calculator.calculateLongTermPoints("Brazil", prediction, openingMatch, groupStageEnd);
        assertEquals(5, points, "Group stage late long term prediction should yield 5 points");
    }
}
