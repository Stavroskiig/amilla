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
import com.amilla.domain.model.UserRankHistory;
import com.amilla.ports.outbound.UserRankHistoryRepositoryPort;
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
    private final PointCalculatorService pointCalculatorService;
    private final UserRankHistoryRepositoryPort userRankHistoryRepository;

    public MatchService(
            MatchRepositoryPort matchRepository,
            PredictionRepositoryPort predictionRepository,
            LongTermPredictionRepositoryPort longTermPredictionRepository,
            UserRepositoryPort userRepository,
            FootballApiPort footballApi,
            PointCalculatorService pointCalculatorService,
            UserRankHistoryRepositoryPort userRankHistoryRepository) {
        this.matchRepository = matchRepository;
        this.predictionRepository = predictionRepository;
        this.longTermPredictionRepository = longTermPredictionRepository;
        this.userRepository = userRepository;
        this.footballApi = footballApi;
        this.pointCalculatorService = pointCalculatorService;
        this.userRankHistoryRepository = userRankHistoryRepository;
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
            user.setPreviousRank(null);
        }

        List<Match> finishedMatches = matchRepository.findAll().stream()
                .filter(m -> "FINISHED".equalsIgnoreCase(m.getStatus()))
                .sorted(Comparator.comparing(Match::getKickoffTime))
                .collect(Collectors.toList());

        List<Prediction> predictions = predictionRepository.findAll();

        int totalFinished = finishedMatches.size();

        userRankHistoryRepository.deleteAll();

        // We will build history step-by-step chronologically
        for (int mIdx = 0; mIdx < totalFinished; mIdx++) {
            Match match = finishedMatches.get(mIdx);
            applyMatchPointsToUsers(match, predictions, users);

            // Sort users by points at this stage to record intermediate ranks
            users.sort(Comparator.comparingInt(User::getTotalPoints).reversed());

            for (int i = 0; i < users.size(); i++) {
                User u = users.get(i);
                UserRankHistory history = UserRankHistory.builder()
                        .id(UUID.randomUUID())
                        .userId(u.getId())
                        .matchId(match.getId())
                        .points(u.getTotalPoints())
                        .rank(i + 1)
                        .createdAt(Instant.now())
                        .build();
                userRankHistoryRepository.save(history);

                // If this is the second-to-last match, we cache this rank as their previousRank
                if (totalFinished > 1 && mIdx == totalFinished - 2) {
                    u.setPreviousRank(i + 1);
                }
            }
        }

        // If there's 0 or 1 finished matches, previous rank is 0 for everyone
        if (totalFinished <= 1) {
            for (User u : users) {
                u.setPreviousRank(0);
            }
        }

        // 4. Update predictions that do NOT belong to any finished matches (e.g. set to 0)
        for (Prediction pred : predictions) {
            boolean belongsToFinished = finishedMatches.stream()
                    .anyMatch(m -> m.getId().equals(pred.getMatchId()));
            if (!belongsToFinished) {
                pred.setPointsEarned(0);
                predictionRepository.save(pred);
            }
        }

        // 5. Calculate long term prediction points if tournament is finished
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
                        .filter(t -> t != null)
                        .min(Comparator.naturalOrder())
                        .orElse(Instant.now());
                Instant groupStageEnd = allMatches.stream()
                        .filter(m -> !"GROUP".equalsIgnoreCase(m.getMatchStage()))
                        .map(Match::getKickoffTime)
                        .filter(t -> t != null)
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

        // Calculate current streaks
        List<Prediction> allPreds = predictionRepository.findAll();
        for (User user : users) {
            int streak = calculateCurrentStreak(user.getId(), allPreds, finishedMatches);
            user.setCurrentStreak(streak);
        }

        // Save users
        for (User user : users) {
            userRepository.save(user);
        }
        log.info("Recalculation complete.");
    }

    private void applyMatchPointsToUsers(Match match, List<Prediction> predictions, List<User> users) {
        List<Prediction> matchPreds = predictions.stream()
                .filter(p -> p.getMatchId().equals(match.getId()))
                .collect(Collectors.toList());

        for (Prediction pred : matchPreds) {
            int pts = pointCalculatorService.calculateMatchPoints(match, pred);
            pred.setPointsEarned(pts);
            predictionRepository.save(pred);

            // Add points to User in memory
            users.stream()
                    .filter(u -> u.getId().equals(pred.getUserId()))
                    .findFirst()
                    .ifPresent(u -> u.setTotalPoints(u.getTotalPoints() + pts));
        }
    }

    private int calculateCurrentStreak(UUID userId, List<Prediction> allPredictions, List<Match> finishedMatches) {
        List<Prediction> userFinishedPreds = allPredictions.stream()
                .filter(p -> p.getUserId().equals(userId))
                .filter(p -> finishedMatches.stream().anyMatch(m -> m.getId().equals(p.getMatchId())))
                .collect(Collectors.toList());

        // Sort finished predictions by match kickoff time descending (most recent first)
        userFinishedPreds.sort((p1, p2) -> {
            Match m1 = finishedMatches.stream().filter(m -> m.getId().equals(p1.getMatchId())).findFirst().orElse(null);
            Match m2 = finishedMatches.stream().filter(m -> m.getId().equals(p2.getMatchId())).findFirst().orElse(null);
            if (m1 == null || m2 == null) return 0;
            return m2.getKickoffTime().compareTo(m1.getKickoffTime());
        });

        int streak = 0;
        for (Prediction pred : userFinishedPreds) {
            if (pred.getPointsEarned() > 0) {
                streak++;
            } else {
                break; // streak broken
            }
        }
        return streak;
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

        // Save current rank before settling this match as previousRank
        List<User> usersBefore = userRepository.findAllOrderByPointsDesc();
        for (int i = 0; i < usersBefore.size(); i++) {
            User u = usersBefore.get(i);
            u.setPreviousRank(i + 1);
            userRepository.save(u);
        }

        for (Prediction pred : predictions) {
            int pts = pointCalculatorService.calculateMatchPoints(match, pred);
            pred.setPointsEarned(pts);
            predictionRepository.save(pred);

            // Update user points
            userRepository.findById(pred.getUserId()).ifPresent(user -> {
                user.setTotalPoints(user.getTotalPoints() + pts);
                userRepository.save(user);
            });
        }

        // Recalculate streaks for all users
        List<User> allUsers = userRepository.findAll();
        List<Prediction> allPreds = predictionRepository.findAll();
        List<Match> allFinishedMatches = matchRepository.findAll().stream()
                .filter(m -> "FINISHED".equalsIgnoreCase(m.getStatus()))
                .collect(Collectors.toList());

        for (User user : allUsers) {
            int streak = calculateCurrentStreak(user.getId(), allPreds, allFinishedMatches);
            user.setCurrentStreak(streak);
            userRepository.save(user);
        }

        // Save rank and points history snapshot after settling this match
        List<User> usersAfter = userRepository.findAllOrderByPointsDesc();
        for (int i = 0; i < usersAfter.size(); i++) {
            User u = usersAfter.get(i);
            UserRankHistory history = UserRankHistory.builder()
                    .id(UUID.randomUUID())
                    .userId(u.getId())
                    .matchId(match.getId())
                    .points(u.getTotalPoints())
                    .rank(i + 1)
                    .createdAt(Instant.now())
                    .build();
            userRankHistoryRepository.save(history);
        }

        // Check if champion was decided in this match (if it's the final)
        if ("FINAL".equalsIgnoreCase(match.getMatchStage())) {
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
