package com.amilla.application.service;

import com.amilla.domain.exception.PredictionsLockedException;
import com.amilla.domain.model.LongTermPrediction;
import com.amilla.domain.model.Match;
import com.amilla.domain.model.Prediction;
import com.amilla.domain.service.PredictionDomainService;
import com.amilla.ports.inbound.SubmitPredictionUseCase;
import com.amilla.ports.outbound.LongTermPredictionRepositoryPort;
import com.amilla.ports.outbound.MatchRepositoryPort;
import com.amilla.ports.outbound.PredictionRepositoryPort;
import com.amilla.ports.outbound.UserRepositoryPort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PredictionService implements SubmitPredictionUseCase {

    private final MatchRepositoryPort matchRepository;
    private final PredictionRepositoryPort predictionRepository;
    private final LongTermPredictionRepositoryPort longTermPredictionRepository;
    private final PredictionDomainService predictionDomainService;
    private final UserRepositoryPort userRepository;

    public PredictionService(
            MatchRepositoryPort matchRepository,
            PredictionRepositoryPort predictionRepository,
            LongTermPredictionRepositoryPort longTermPredictionRepository,
            PredictionDomainService predictionDomainService,
            UserRepositoryPort userRepository) {
        this.matchRepository = matchRepository;
        this.predictionRepository = predictionRepository;
        this.longTermPredictionRepository = longTermPredictionRepository;
        this.predictionDomainService = predictionDomainService;
        this.userRepository = userRepository;
    }

    @Override
    public Prediction submitMatchPrediction(UUID userId, String matchId, int homeScore, int awayScore, String qualifier) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found: " + matchId));

        predictionDomainService.validatePredictionSubmissionAllowed(match, Instant.now());

        Prediction prediction = predictionRepository.findByUserIdAndMatchId(userId, matchId)
                .orElse(Prediction.builder()
                        .id(UUID.randomUUID())
                        .userId(userId)
                        .matchId(matchId)
                        .build());

        prediction.setPredictedHomeScore(homeScore);
        prediction.setPredictedAwayScore(awayScore);
        prediction.setPredictedQualifier(qualifier);
        prediction.setUpdatedAt(Instant.now());

        return predictionRepository.save(prediction);
    }

    @Override
    public LongTermPrediction submitLongTermPrediction(UUID userId, String championTeam) {
        // Calculate dynamic cutoff: group stage end is the kickoff of the first knockout (ROUND_OF_16) match.
        // Fallback to 30 days from now if not present.
        List<Match> matches = matchRepository.findAll();
        Instant groupStageEnd = matches.stream()
                .filter(m -> !"GROUP".equalsIgnoreCase(m.getMatchStage()))
                .map(Match::getKickoffTime)
                .min(Comparator.naturalOrder())
                .orElse(Instant.now().plus(30, ChronoUnit.DAYS));

        predictionDomainService.validateLongTermPredictionAllowed(groupStageEnd, Instant.now());

        LongTermPrediction prediction = LongTermPrediction.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .predictedChampionTeam(championTeam)
                .submittedAt(Instant.now())
                .build();

        return longTermPredictionRepository.save(prediction);
    }

    @Override
    public Prediction getPrediction(UUID userId, String matchId) {
        return predictionRepository.findByUserIdAndMatchId(userId, matchId).orElse(null);
    }

    @Override
    public List<Prediction> getPredictionsByUser(UUID userId) {
        return predictionRepository.findByUserId(userId);
    }

    @Override
    public List<Prediction> getAllPredictionsForMatch(String matchId) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found: " + matchId));

        predictionDomainService.validateOtherPredictionsVisibility(match, Instant.now());

        List<Prediction> predictions = predictionRepository.findByMatchId(matchId);
        for (Prediction p : predictions) {
            userRepository.findById(p.getUserId()).ifPresent(user -> p.setUsername(user.getUsername()));
        }
        return predictions;
    }

    @Override
    public LongTermPrediction getLongTermPrediction(UUID userId) {
        return longTermPredictionRepository.findByUserId(userId).orElse(null);
    }
}
