package com.amilla.application.service;

import com.amilla.domain.model.LongTermPrediction;
import com.amilla.domain.model.Match;
import com.amilla.domain.model.Prediction;
import com.amilla.domain.service.PredictionDomainService;
import com.amilla.ports.inbound.SubmitPredictionUseCase;
import com.amilla.ports.outbound.LongTermPredictionRepositoryPort;
import com.amilla.ports.outbound.MatchRepositoryPort;
import com.amilla.ports.outbound.PredictionRepositoryPort;
import com.amilla.ports.outbound.TournamentSettingsRepositoryPort;
import com.amilla.ports.outbound.UserRepositoryPort;
import org.springframework.stereotype.Service;
import java.util.Map;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class PredictionService implements SubmitPredictionUseCase {

    private final MatchRepositoryPort matchRepository;
    private final PredictionRepositoryPort predictionRepository;
    private final LongTermPredictionRepositoryPort longTermPredictionRepository;
    private final PredictionDomainService predictionDomainService;
    private final UserRepositoryPort userRepository;
    private final TournamentSettingsRepositoryPort settingsRepository;

    public PredictionService(
            MatchRepositoryPort matchRepository,
            PredictionRepositoryPort predictionRepository,
            LongTermPredictionRepositoryPort longTermPredictionRepository,
            PredictionDomainService predictionDomainService,
            UserRepositoryPort userRepository,
            TournamentSettingsRepositoryPort settingsRepository) {
        this.matchRepository = matchRepository;
        this.predictionRepository = predictionRepository;
        this.longTermPredictionRepository = longTermPredictionRepository;
        this.predictionDomainService = predictionDomainService;
        this.userRepository = userRepository;
        this.settingsRepository = settingsRepository;
    }

    @Override
    public Prediction submitMatchPrediction(UUID userId, String matchId, int homeScore, int awayScore,
            String qualifier, String predictedQualificationMethod) {
        Match match = matchRepository.findById(matchId)
                .orElseThrow(() -> new IllegalArgumentException("Match not found: " + matchId));

        predictionDomainService.validatePredictionSubmissionAllowed(match, Instant.now());

        boolean isKnockout = !"GROUP".equalsIgnoreCase(match.getMatchStage());
        if (isKnockout) {
            if (homeScore == awayScore && (qualifier == null || qualifier.trim().isEmpty() || predictedQualificationMethod == null || predictedQualificationMethod.trim().isEmpty())) {
                throw new IllegalArgumentException("Πρέπει να επιλέξετε ομάδα και τρόπο πρόκρισης (Παράταση/Πέναλτι)!");
            }
            if (homeScore > awayScore) {
                qualifier = match.getHomeTeam();
                predictedQualificationMethod = "REGULAR_TIME";
            } else if (awayScore > homeScore) {
                qualifier = match.getAwayTeam();
                predictedQualificationMethod = "REGULAR_TIME";
            } else {
                if (!"EXTRA_TIME".equals(predictedQualificationMethod) && !"PENALTIES".equals(predictedQualificationMethod)) {
                    throw new IllegalArgumentException("Μη έγκυρος τρόπος πρόκρισης.");
                }
            }
        } else {
            qualifier = null;
            predictedQualificationMethod = null;
        }

        Prediction prediction = predictionRepository.findByUserIdAndMatchId(userId, matchId)
                .orElseGet(() -> Prediction.builder()
                        .id(UUID.randomUUID())
                        .userId(userId)
                        .matchId(matchId)
                        .createdAt(Instant.now())
                        .build());

        prediction.setPredictedHomeScore(homeScore);
        prediction.setPredictedAwayScore(awayScore);
        prediction.setPredictedQualifier(qualifier);
        prediction.setPredictedQualificationMethod(predictedQualificationMethod);
        prediction.setUpdatedAt(Instant.now());

        return predictionRepository.save(prediction);
    }

    @Override
    public LongTermPrediction submitLongTermPrediction(UUID userId, String championTeam, String predictedTopScorer) {
        // Calculate dynamic cutoff: group stage end is the kickoff of the first
        // knockout (ROUND_OF_16) match.
        // Fallback to 30 days from now if not present.
        List<Match> matches = matchRepository.findAll();
        Instant groupStageEnd = matches.stream()
                .filter(m -> !"GROUP".equalsIgnoreCase(m.getMatchStage()))
                .map(Match::getKickoffTime)
                .filter(t -> t != null)
                .min(Comparator.naturalOrder())
                .orElse(Instant.now().plus(30, ChronoUnit.DAYS));

        Instant now = Instant.now();
        Instant topScorerCutoff = Instant.parse("2026-06-18T16:00:00Z");

        LongTermPrediction prediction = longTermPredictionRepository.findByUserId(userId)
                .orElse(LongTermPrediction.builder()
                        .id(UUID.randomUUID())
                        .userId(userId)
                        .build());

        if (championTeam != null && !championTeam.trim().isEmpty()) {
            predictionDomainService.validateLongTermPredictionAllowed(groupStageEnd, now);
            Double odds = null;
            try {
                org.springframework.core.io.ClassPathResource resource = new org.springframework.core.io.ClassPathResource(
                        "champion-odds-seed.json");
                if (resource.exists()) {
                    try (java.io.InputStream is = resource.getInputStream()) {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        java.util.Map<String, Double> championOddsMap = mapper.readValue(is,
                                new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Double>>() {
                                });
                        odds = championOddsMap.get(championTeam);
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to read champion odds: " + e.getMessage());
            }
            prediction.setPredictedChampionTeam(championTeam);
            prediction.setChampionOdds(odds);
            prediction.setSubmittedAt(Instant.now());
        }

        if (predictedTopScorer != null && !predictedTopScorer.trim().isEmpty()) {
            predictionDomainService.validateTopScorerPredictionAllowed(topScorerCutoff, now);
            Double odds = null;
            try {
                org.springframework.core.io.ClassPathResource resource = new org.springframework.core.io.ClassPathResource(
                        "topscorer-odds-seed.json");
                if (resource.exists()) {
                    try (java.io.InputStream is = resource.getInputStream()) {
                        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                        java.util.Map<String, Double> topScorerOddsMap = mapper.readValue(is,
                                new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Double>>() {
                                });
                        odds = topScorerOddsMap.get(predictedTopScorer);
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to read top scorer odds: " + e.getMessage());
            }
            prediction.setPredictedTopScorer(predictedTopScorer);
            prediction.setTopScorerOdds(odds);
            prediction.setTopScorerSubmittedAt(Instant.now());

            Map<String, Integer> currentGoals = settingsRepository.getAllPlayerGoals();
            if (!currentGoals.containsKey(predictedTopScorer)) {
                settingsRepository.savePlayerGoal(predictedTopScorer, 0);
            }
        }

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

    @Override
    public List<LongTermPrediction> getAllLongTermPredictions() {
        List<Match> matches = matchRepository.findAll();
        Instant groupStageEnd = matches.stream()
                .filter(m -> !"GROUP".equalsIgnoreCase(m.getMatchStage()))
                .map(Match::getKickoffTime)
                .filter(t -> t != null)
                .min(Comparator.naturalOrder())
                .orElse(Instant.now().plus(30, ChronoUnit.DAYS));

        Instant topScorerCutoff = Instant.parse("2024-06-18T16:00:00Z");
        predictionDomainService.validateOtherLongTermPredictionsVisibility(groupStageEnd, topScorerCutoff,
                Instant.now());

        List<LongTermPrediction> predictions = longTermPredictionRepository.findAll();
        for (LongTermPrediction p : predictions) {
            userRepository.findById(p.getUserId()).ifPresent(user -> p.setUsername(user.getUsername()));
        }
        return predictions;
    }

    @Override
    public List<LongTermPrediction> getAdminAllLongTermPredictions() {
        List<LongTermPrediction> predictions = longTermPredictionRepository.findAll();
        for (LongTermPrediction p : predictions) {
            userRepository.findById(p.getUserId()).ifPresent(user -> p.setUsername(user.getUsername()));
        }
        return predictions;
    }
}
