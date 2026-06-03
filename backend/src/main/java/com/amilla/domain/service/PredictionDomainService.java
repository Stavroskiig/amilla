package com.amilla.domain.service;

import com.amilla.domain.exception.PredictionsLockedException;
import com.amilla.domain.exception.TournamentStartedException;
import com.amilla.domain.model.Match;
import com.amilla.domain.model.Prediction;
import com.amilla.domain.model.LongTermPrediction;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Pure Java Domain Service managing predictions rules and visibility.
 * Adheres to Hexagonal Architecture (no framework annotations).
 */
public class PredictionDomainService {

    private static final int LOCK_MINUTES_BEFORE_KICKOFF = 5;

    /**
     * Asserts if a match prediction is currently editable.
     * Throws PredictionsLockedException if it is within 5 minutes of kickoff.
     *
     * @param match The match to predict.
     * @param now The current timestamp.
     */
    public void validatePredictionSubmissionAllowed(Match match, Instant now) {
        Instant lockTime = match.getKickoffTime().minus(LOCK_MINUTES_BEFORE_KICKOFF, ChronoUnit.MINUTES);
        if (now.isAfter(lockTime)) {
            throw new PredictionsLockedException("Predictions for this match locked 5 minutes before kickoff!");
        }
    }

    /**
     * Asserts if users are allowed to see predictions of other users for this match.
     * Throws PredictionsLockedException if predictions are still locked and private.
     *
     * @param match The match in question.
     * @param now The current timestamp.
     */
    public void validateOtherPredictionsVisibility(Match match, Instant now) {
        Instant lockTime = match.getKickoffTime().minus(LOCK_MINUTES_BEFORE_KICKOFF, ChronoUnit.MINUTES);
        // Visibility is allowed once we pass the lock time (i.e. now is after lockTime)
        if (now.isBefore(lockTime)) {
            throw new PredictionsLockedException("Predictions made by other users will be visible 5 minutes before kickoff!");
        }
    }

    /**
     * Asserts if a long term champion prediction can be submitted or edited.
     * Throws TournamentStartedException if the group stage has already ended.
     *
     * @param groupStageEnd The timestamp when the group stage ended/ends.
     * @param now The current timestamp.
     */
    public void validateLongTermPredictionAllowed(Instant groupStageEnd, Instant now) {
        if (now.isAfter(groupStageEnd)) {
            throw new TournamentStartedException("Long-term champion predictions are locked since the group stage has ended!");
        }
    }

    /**
     * Returns true if predictions for the match are locked.
     */
    public boolean isMatchLocked(Match match, Instant now) {
        Instant lockTime = match.getKickoffTime().minus(LOCK_MINUTES_BEFORE_KICKOFF, ChronoUnit.MINUTES);
        return now.isAfter(lockTime);
    }
}
