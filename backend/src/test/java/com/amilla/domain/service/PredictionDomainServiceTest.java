package com.amilla.domain.service;

import com.amilla.domain.exception.PredictionsLockedException;
import com.amilla.domain.exception.TournamentStartedException;
import com.amilla.domain.model.Match;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

public class PredictionDomainServiceTest {

    private final PredictionDomainService service = new PredictionDomainService();

    @Test
    public void testSubmissionAllowedWhenKickoffIsFarInFuture() {
        Match match = Match.builder()
                .kickoffTime(Instant.now().plus(10, ChronoUnit.MINUTES))
                .build();

        // 10 minutes in the future is > 5 minutes, so it should be allowed
        assertDoesNotThrow(() -> service.validatePredictionSubmissionAllowed(match, Instant.now()));
    }

    @Test
    public void testSubmissionBlockedWhenKickoffIsClose() {
        Match match = Match.builder()
                .kickoffTime(Instant.now().plus(4, ChronoUnit.MINUTES))
                .build();

        // 4 minutes in the future is < 5 minutes, so it should throw lock exception
        assertThrows(PredictionsLockedException.class, 
                () -> service.validatePredictionSubmissionAllowed(match, Instant.now()));
    }

    @Test
    public void testOtherPredictionsHiddenBeforeLock() {
        Match match = Match.builder()
                .kickoffTime(Instant.now().plus(6, ChronoUnit.MINUTES))
                .build();

        // 6 minutes in the future is before the T-5 lockout, predictions should be private
        assertThrows(PredictionsLockedException.class, 
                () -> service.validateOtherPredictionsVisibility(match, Instant.now()));
    }

    @Test
    public void testOtherPredictionsVisibleAfterLock() {
        Match match = Match.builder()
                .kickoffTime(Instant.now().plus(4, ChronoUnit.MINUTES))
                .build();

        // 4 minutes in the future is after the T-5 lockout, so predictions should be visible
        assertDoesNotThrow(() -> service.validateOtherPredictionsVisibility(match, Instant.now()));
    }

    @Test
    public void testLongTermBlockedAfterGroupStageEnds() {
        Instant groupStageEnd = Instant.now().minus(1, ChronoUnit.HOURS); // Group stage ended 1 hour ago
        
        assertThrows(TournamentStartedException.class, 
                () -> service.validateLongTermPredictionAllowed(groupStageEnd, Instant.now()));
    }

    @Test
    public void testLongTermAllowedBeforeGroupStageEnds() {
        Instant groupStageEnd = Instant.now().plus(1, ChronoUnit.HOURS); // Group stage ends in 1 hour
        
        assertDoesNotThrow(() -> service.validateLongTermPredictionAllowed(groupStageEnd, Instant.now()));
    }
}
