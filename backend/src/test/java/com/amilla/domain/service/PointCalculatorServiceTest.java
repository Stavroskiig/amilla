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
    public void testExactScoreMatchWithOdds() {
        Match match = Match.builder()
                .homeScore90(2)
                .awayScore90(1)
                .matchStage("GROUP")
                .exactScoreOddsJson("{\"1-0\":8.0, \"2-1\":12.5}")
                .build();

        Prediction prediction = Prediction.builder()
                .predictedHomeScore(2)
                .predictedAwayScore(1)
                .build();

        int points = calculator.calculateMatchPoints(match, prediction);
        // 10 * 12.5 = 125
        assertEquals(125, points, "Exact score match should yield 10 * odds points");
    }

    @Test
    public void testOutcomeMatchSignOnlyWithOdds() {
        Match match = Match.builder()
                .homeScore90(3)
                .awayScore90(1)
                .matchStage("GROUP")
                .homeOdds(2.5)
                .build();

        Prediction prediction = Prediction.builder()
                .predictedHomeScore(1)
                .predictedAwayScore(0) // Both are Home team wins, but different scores
                .build();

        int points = calculator.calculateMatchPoints(match, prediction);
        // 10 * 2.5 = 25
        assertEquals(25, points, "Outcome sign match only should yield 10 * odds points");
    }

    @Test
    public void testNoPoints() {
        Match match = Match.builder()
                .homeScore90(3)
                .awayScore90(1)
                .matchStage("GROUP")
                .homeOdds(1.5)
                .awayOdds(6.0)
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
        // Exact fallback (15.0 * 10 = 150) + qualifier bonus (10) = 160
        assertEquals(160, points1, "Exact score (150) + qualifier bonus (10) should yield 160 points");

        // User predicted 2-2 and France qualifying (sign match + wrong qualifier)
        Prediction prediction2 = Prediction.builder()
                .predictedHomeScore(2)
                .predictedAwayScore(2)
                .predictedQualifier("France")
                .build();

        int points2 = calculator.calculateMatchPoints(match, prediction2);
        // Sign fallback (1.0 * 10 = 10) + wrong qualifier (0) = 10
        assertEquals(10, points2, "Sign match (10) + wrong qualifier (0) should yield 10 points");
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
        assertEquals(50, points, "Early bird long term prediction should yield 50 points");
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
        assertEquals(25, points, "Group stage late long term prediction should yield 25 points");
    }
}
