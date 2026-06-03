package com.amilla.application.service;

import com.amilla.domain.model.LongTermPrediction;
import com.amilla.domain.model.Match;
import com.amilla.domain.model.Prediction;
import com.amilla.domain.model.User;
import com.amilla.domain.service.PointCalculatorService;
import com.amilla.ports.inbound.ManageMatchUseCase;
import com.amilla.ports.outbound.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import java.io.InputStream;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class MatchService implements ManageMatchUseCase {

    private static final Logger log = LoggerFactory.getLogger(MatchService.class);

    private final MatchRepositoryPort matchRepository;
    private final PredictionRepositoryPort predictionRepository;
    private final LongTermPredictionRepositoryPort longTermPredictionRepository;
    private final UserRepositoryPort userRepository;
    private final FootballApiPort footballApi;
    private final NotificationPort notificationPort;
    private final PointCalculatorService pointCalculatorService;

    public MatchService(
            MatchRepositoryPort matchRepository,
            PredictionRepositoryPort predictionRepository,
            LongTermPredictionRepositoryPort longTermPredictionRepository,
            UserRepositoryPort userRepository,
            FootballApiPort footballApi,
            NotificationPort notificationPort,
            PointCalculatorService pointCalculatorService) {
        this.matchRepository = matchRepository;
        this.predictionRepository = predictionRepository;
        this.longTermPredictionRepository = longTermPredictionRepository;
        this.userRepository = userRepository;
        this.footballApi = footballApi;
        this.notificationPort = notificationPort;
        this.pointCalculatorService = pointCalculatorService;
    }

    @Override
    public List<Match> getAllMatches() {
        return matchRepository.findAll().stream()
                .sorted(Comparator.comparing(Match::getKickoffTime))
                .collect(Collectors.toList());
    }

    @Override
    public Match getMatch(String id) {
        return matchRepository.findById(id).orElse(null);
    }

    @Override
    public Match manuallyUpdateMatchScore(String id, Integer homeScore, Integer awayScore, String qualifiedTeam, String status) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Match not found: " + id));

        boolean wasFinished = "FINISHED".equalsIgnoreCase(match.getStatus());
        boolean becomingFinished = "FINISHED".equalsIgnoreCase(status);

        match.setHomeScore90(homeScore);
        match.setAwayScore90(awayScore);
        match.setQualifiedTeam(qualifiedTeam);
        match.setStatus(status);

        Match savedMatch = matchRepository.save(match);

        if (!wasFinished && becomingFinished) {
            log.info("Match {} manually set to FINISHED. Calculating points.", id);
            settleMatchPoints(savedMatch);
        }

        return savedMatch;
    }

    @Override
    public void syncMatchesWithExternalApi() {
        log.info("Triggered external matches sync...");
        List<Match> externalMatches = footballApi.fetchFixturesAndResults();
        if (externalMatches.isEmpty()) {
            log.warn("No matches returned from external API.");
            return;
        }

        for (Match ext : externalMatches) {
            Optional<Match> localOpt = matchRepository.findById(ext.getId());
            if (localOpt.isEmpty()) {
                matchRepository.save(ext);
                log.info("Synced new match: {} vs {}", ext.getHomeTeam(), ext.getAwayTeam());
            } else {
                Match local = localOpt.get();
                boolean wasFinished = "FINISHED".equalsIgnoreCase(local.getStatus());
                boolean becomingFinished = "FINISHED".equalsIgnoreCase(ext.getStatus());

                // Update only if not already finished manually or scores match
                local.setKickoffTime(ext.getKickoffTime());
                local.setHomeTeam(ext.getHomeTeam());
                local.setAwayTeam(ext.getAwayTeam());
                local.setMatchStage(ext.getMatchStage());
                
                if (!wasFinished) {
                    local.setHomeScore90(ext.getHomeScore90());
                    local.setAwayScore90(ext.getAwayScore90());
                    local.setQualifiedTeam(ext.getQualifiedTeam());
                    local.setStatus(ext.getStatus());
                    
                    Match saved = matchRepository.save(local);
                    
                    if (becomingFinished) {
                        log.info("Match {} finished on sync. Settling points.", local.getId());
                        settleMatchPoints(saved);
                    }
                }
            }
        }
    }

    @Override
    public void forceRecalculatePoints() {
        log.info("Recalculating all points from scratch...");
        List<User> users = userRepository.findAll();
        for (User user : users) {
            user.setTotalPoints(0);
        }

        List<Match> finishedMatches = matchRepository.findAll().stream()
                .filter(m -> "FINISHED".equalsIgnoreCase(m.getStatus()))
                .collect(Collectors.toList());

        List<Prediction> predictions = predictionRepository.findAll();

        // 1. Calculate match points
        for (Prediction pred : predictions) {
            Optional<Match> matchOpt = finishedMatches.stream()
                    .filter(m -> m.getId().equals(pred.getMatchId()))
                    .findFirst();

            if (matchOpt.isPresent()) {
                Match match = matchOpt.get();
                int pts = pointCalculatorService.calculateMatchPoints(match, pred);
                pred.setPointsEarned(pts);
                predictionRepository.save(pred);

                // Add to user
                users.stream()
                        .filter(u -> u.getId().equals(pred.getUserId()))
                        .findFirst()
                        .ifPresent(u -> u.setTotalPoints(u.getTotalPoints() + pts));
            } else {
                pred.setPointsEarned(0);
                predictionRepository.save(pred);
            }
        }

        // 2. Calculate long term prediction points if tournament is finished
        Optional<Match> finalMatch = matchRepository.findAll().stream()
                .filter(m -> "FINAL".equalsIgnoreCase(m.getMatchStage()))
                .findFirst();

        if (finalMatch.isPresent() && "FINISHED".equalsIgnoreCase(finalMatch.get().getStatus())) {
            String champion = finalMatch.get().getQualifiedTeam();
            if (champion == null) {
                // If it's the final, whoever won the final is the champion
                Integer home = finalMatch.get().getHomeScore90();
                Integer away = finalMatch.get().getAwayScore90();
                if (home != null && away != null) {
                    if (home > away) {
                        champion = finalMatch.get().getHomeTeam();
                    } else if (away > home) {
                        champion = finalMatch.get().getAwayTeam();
                    }
                }
            }

            if (champion != null) {
                List<Match> allMatches = matchRepository.findAll();
                Instant openingKickoff = allMatches.stream()
                        .map(Match::getKickoffTime)
                        .min(Comparator.naturalOrder())
                        .orElse(Instant.now());
                Instant groupStageEnd = allMatches.stream()
                        .filter(m -> !"GROUP".equalsIgnoreCase(m.getMatchStage()))
                        .map(Match::getKickoffTime)
                        .min(Comparator.naturalOrder())
                        .orElse(Instant.now().plusSeconds(3600 * 24 * 14));

                List<LongTermPrediction> longTermPreds = longTermPredictionRepository.findAll();
                for (LongTermPrediction ltPred : longTermPreds) {
                    int pts = pointCalculatorService.calculateLongTermPoints(champion, ltPred, openingKickoff, groupStageEnd);
                    if (pts > 0) {
                        users.stream()
                                .filter(u -> u.getId().equals(ltPred.getUserId()))
                                .findFirst()
                                .ifPresent(u -> u.setTotalPoints(u.getTotalPoints() + pts));
                    }
                }
            }
        }

        // Save users
        for (User user : users) {
            userRepository.save(user);
        }
        log.info("Recalculation complete.");
    }

    @Override
    public Prediction adminOverridePrediction(UUID userId, String matchId, int homeScore, int awayScore, String qualifier) {
        log.info("Admin override prediction for user {} match {}", userId, matchId);
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

        Prediction saved = predictionRepository.save(prediction);

        // If match is finished, recalculate points immediately
        Optional<Match> matchOpt = matchRepository.findById(matchId);
        if (matchOpt.isPresent() && "FINISHED".equalsIgnoreCase(matchOpt.get().getStatus())) {
            forceRecalculatePoints();
        }

        return saved;
    }

    private void settleMatchPoints(Match match) {
        List<Prediction> predictions = predictionRepository.findByMatchId(match.getId());
        StringBuilder viberMessage = new StringBuilder();
        viberMessage.append(String.format("⚽ Το ματς %s - %s έληξε! (Σκορ: %d - %d)\n",
                match.getHomeTeam(), match.getAwayTeam(), match.getHomeScore90(), match.getAwayScore90()));

        boolean exactFinderExists = false;

        for (Prediction pred : predictions) {
            int pts = pointCalculatorService.calculateMatchPoints(match, pred);
            pred.setPointsEarned(pts);
            predictionRepository.save(pred);

            // Update user points
            userRepository.findById(pred.getUserId()).ifPresent(user -> {
                user.setTotalPoints(user.getTotalPoints() + pts);
                userRepository.save(user);

                if (pts == 5) {
                    viberMessage.append(String.format("🔥 Ο @%s βρήκε το ΑΚΡΙΒΕΣ ΣΚΟΡ (+5 πόντοι)!\n", user.getUsername()));
                }
            });
        }

        // Send Viber update
        notificationPort.sendNotification(viberMessage.toString());

        // Check if champion was decided in this match (if it's the final)
        if ("FINAL".equalsIgnoreCase(match.getMatchStage())) {
            notificationPort.sendNotification("🏆 Ο ΤΕΛΙΚΟΣ ΤΕΛΕΙΩΣΕ! Ολοκληρώνεται ο υπολογισμός των μακροχρόνιων προβλέψεων!");
            forceRecalculatePoints();
        }
    }

    @Override
    public Match createMatch(Match match) {
        if (match.getId() == null || match.getId().trim().isEmpty()) {
            match.setId(UUID.randomUUID().toString());
        }
        if (match.getStatus() == null || match.getStatus().trim().isEmpty()) {
            match.setStatus("SCHEDULED");
        }
        log.info("Creating new match manually: {} vs {}", match.getHomeTeam(), match.getAwayTeam());
        return matchRepository.save(match);
    }

    @Override
    public List<Match> bulkCreateMatches(List<Match> matches) {
        log.info("Bulk creating {} matches manually", matches.size());
        for (Match match : matches) {
            if (match.getId() == null || match.getId().trim().isEmpty()) {
                match.setId(UUID.randomUUID().toString());
            }
            if (match.getStatus() == null || match.getStatus().trim().isEmpty()) {
                match.setStatus("SCHEDULED");
            }
        }
        return matchRepository.saveAll(matches);
    }

    @Override
    public void deleteMatch(String id) {
        log.info("Deleting match {} and its predictions", id);
        predictionRepository.deleteByMatchId(id);
        matchRepository.deleteById(id);
    }

    @Override
    public void deleteAllMatches() {
        log.info("Deleting all matches and all predictions");
        predictionRepository.deleteAll();
        matchRepository.deleteAll();
    }

    @Override
    public void seedMatchesFromJson() {
        try {
            log.info("Checking database for seeding...");
            List<Match> existing = matchRepository.findAll();
            if (existing.isEmpty()) {
                log.info("Database is empty. Loading seeds from matches-seed.json...");
                ClassPathResource resource = new ClassPathResource("matches-seed.json");
                if (resource.exists()) {
                    try (InputStream is = resource.getInputStream()) {
                        ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();
                        List<Match> seedMatches = mapper.readValue(is, new TypeReference<List<Match>>() {});
                        for (Match match : seedMatches) {
                            if (match.getStatus() == null || match.getStatus().trim().isEmpty()) {
                                match.setStatus("SCHEDULED");
                            }
                            matchRepository.save(match);
                        }
                        log.info("Successfully seeded {} matches.", seedMatches.size());
                    }
                } else {
                    log.warn("matches-seed.json not found in classpath. Seeding skipped.");
                }
            } else {
                log.info("Database already has matches. Seeding skipped.");
            }
        } catch (Exception e) {
            log.error("Failed to seed matches from JSON", e);
            throw new RuntimeException("Failed to seed matches from JSON: " + e.getMessage(), e);
        }
    }
}
