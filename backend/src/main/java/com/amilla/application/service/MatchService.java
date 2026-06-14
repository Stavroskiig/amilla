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
    private final PointCalculatorService pointCalculatorService;
    private final UserRankHistoryRepositoryPort userRankHistoryRepository;
    private final TournamentSettingsRepositoryPort tournamentSettingsRepository;

    public MatchService(
            MatchRepositoryPort matchRepository,
            PredictionRepositoryPort predictionRepository,
            LongTermPredictionRepositoryPort longTermPredictionRepository,
            UserRepositoryPort userRepository,
            PointCalculatorService pointCalculatorService,
            UserRankHistoryRepositoryPort userRankHistoryRepository,
            TournamentSettingsRepositoryPort tournamentSettingsRepository) {
        this.matchRepository = matchRepository;
        this.predictionRepository = predictionRepository;
        this.longTermPredictionRepository = longTermPredictionRepository;
        this.userRepository = userRepository;
        this.pointCalculatorService = pointCalculatorService;
        this.userRankHistoryRepository = userRankHistoryRepository;
        this.tournamentSettingsRepository = tournamentSettingsRepository;
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
    public Match updateMatchTvChannel(String id, String tvChannel) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Match not found: " + id));
        match.setTvChannel(tvChannel);
        return matchRepository.save(match);
    }

    @Override
    public Match updateMatchOdds(String id, Double homeOdds, Double drawOdds, Double awayOdds, Double homeAdvanceOdds, Double awayAdvanceOdds, String exactScoreOddsJson) {
        Match match = matchRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Match not found: " + id));
        match.setHomeOdds(homeOdds);
        match.setDrawOdds(drawOdds);
        match.setAwayOdds(awayOdds);
        match.setHomeAdvanceOdds(homeAdvanceOdds);
        match.setAwayAdvanceOdds(awayAdvanceOdds);
        match.setExactScoreOddsJson(exactScoreOddsJson);
        return matchRepository.save(match);
    }

    @Override
    public void forceRecalculatePoints() {
        log.info("Recalculating all points from scratch...");
        List<User> users = userRepository.findAll();
        for (User user : users) {
            user.setTotalPoints(0);
            user.setPreviousRank(null);
            user.setExactHits(0);
            user.setCorrectOutcomes(0);
            user.setLongestStreak(0);
            user.setCurrentStreak(0);
            user.setRecentPoints(0);
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
            boolean isLastMatch = (mIdx == totalFinished - 1);
            
            if (isLastMatch) {
                for (User u : users) {
                    u.setRecentPoints(0);
                }
            }
            
            applyMatchPointsToUsers(match, predictions, users, isLastMatch);

            // If this is the final match, apply long-term prediction points before saving the final rank snapshot
            if ("FINAL".equalsIgnoreCase(match.getMatchStage())) {
                applyLongTermPointsToUsers(match, users);
            }

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

        // Calculate current and longest streaks
        List<Prediction> allPreds = predictionRepository.findAll();
        for (User user : users) {
            int[] streaks = calculateStreaks(user.getId(), allPreds, finishedMatches);
            user.setCurrentStreak(streaks[0]);
            user.setLongestStreak(streaks[1]);
        }

        // Save users
        for (User user : users) {
            userRepository.save(user);
        }
        log.info("Recalculation complete.");
    }

    private void applyMatchPointsToUsers(Match match, List<Prediction> predictions, List<User> users, boolean isLastMatch) {
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
                    .ifPresent(u -> {
                        u.setTotalPoints(u.getTotalPoints() + pts);
                        if (isLastMatch) {
                            u.setRecentPoints((u.getRecentPoints() != null ? u.getRecentPoints() : 0) + pts);
                        }
                        
                        int actualHome = match.getHomeScore90() != null ? match.getHomeScore90() : 0;
                        int actualAway = match.getAwayScore90() != null ? match.getAwayScore90() : 0;
                        int predHome = pred.getPredictedHomeScore();
                        int predAway = pred.getPredictedAwayScore();
                        
                        if (actualHome == predHome && actualAway == predAway) {
                            u.setExactHits((u.getExactHits() != null ? u.getExactHits() : 0) + 1);
                            u.setCorrectOutcomes((u.getCorrectOutcomes() != null ? u.getCorrectOutcomes() : 0) + 1);
                        } else if (Integer.signum(actualHome - actualAway) == Integer.signum(predHome - predAway)) {
                            u.setCorrectOutcomes((u.getCorrectOutcomes() != null ? u.getCorrectOutcomes() : 0) + 1);
                        }
                    });
        }
    }

    private void applyLongTermPointsToUsers(Match finalMatch, List<User> users) {
        String champion = tournamentSettingsRepository.getSetting("RESOLVED_CHAMPION");
        if (champion == null && finalMatch != null) {
            champion = finalMatch.getQualifiedTeam();
            if (champion == null) {
                // If it's the final, whoever won the final is the champion
                Integer home = finalMatch.getHomeScore90();
                Integer away = finalMatch.getAwayScore90();
                if (home != null && away != null) {
                    if (home > away) {
                        champion = finalMatch.getHomeTeam();
                    } else if (away > home) {
                        champion = finalMatch.getAwayTeam();
                    }
                }
            }
        }


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
            int pts = 0;
            if (champion != null) {
                pts += pointCalculatorService.calculateLongTermPoints(champion, ltPred, openingKickoff, groupStageEnd);
            }
            // Top Scorer points are independent and no longer count towards general leaderboard
            // if (topScorer != null) {
            //     pts += pointCalculatorService.calculateTopScorerPoints(topScorer, ltPred, openingKickoff, groupStageEnd);
            // }

            if (pts > 0) {
                final int finalPts = pts;
                users.stream()
                        .filter(u -> u.getId().equals(ltPred.getUserId()))
                        .findFirst()
                        .ifPresent(u -> u.setTotalPoints(u.getTotalPoints() + finalPts));
            }
        }
    }

    private int[] calculateStreaks(UUID userId, List<Prediction> allPredictions, List<Match> finishedMatches) {
        List<Prediction> userFinishedPreds = allPredictions.stream()
                .filter(p -> p.getUserId().equals(userId))
                .filter(p -> finishedMatches.stream().anyMatch(m -> m.getId().equals(p.getMatchId())))
                .collect(Collectors.toList());

        // Sort finished predictions by match kickoff time ascending (oldest first)
        userFinishedPreds.sort((p1, p2) -> {
            Match m1 = finishedMatches.stream().filter(m -> m.getId().equals(p1.getMatchId())).findFirst().orElse(null);
            Match m2 = finishedMatches.stream().filter(m -> m.getId().equals(p2.getMatchId())).findFirst().orElse(null);
            if (m1 == null || m2 == null) return 0;
            return m1.getKickoffTime().compareTo(m2.getKickoffTime());
        });

        int currentStreak = 0;
        int longestStreak = 0;
        for (Prediction pred : userFinishedPreds) {
            if (pred.getPointsEarned() > 0) {
                currentStreak++;
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }
            } else {
                currentStreak = 0; // streak broken
            }
        }
        return new int[]{currentStreak, longestStreak};
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

        // Save current rank before settling this match as previousRank, and reset recentPoints
        List<User> usersBefore = userRepository.findAllOrderByPointsDesc();
        for (int i = 0; i < usersBefore.size(); i++) {
            User u = usersBefore.get(i);
            u.setPreviousRank(i + 1);
            u.setRecentPoints(0);
            userRepository.save(u);
        }

        for (Prediction pred : predictions) {
            int pts = pointCalculatorService.calculateMatchPoints(match, pred);
            pred.setPointsEarned(pts);
            predictionRepository.save(pred);

            // Update user points
            userRepository.findById(pred.getUserId()).ifPresent(user -> {
                user.setTotalPoints(user.getTotalPoints() + pts);
                user.setRecentPoints((user.getRecentPoints() != null ? user.getRecentPoints() : 0) + pts);
                
                int actualHome = match.getHomeScore90() != null ? match.getHomeScore90() : 0;
                int actualAway = match.getAwayScore90() != null ? match.getAwayScore90() : 0;
                int predHome = pred.getPredictedHomeScore();
                int predAway = pred.getPredictedAwayScore();
                
                if (actualHome == predHome && actualAway == predAway) {
                    user.setExactHits((user.getExactHits() != null ? user.getExactHits() : 0) + 1);
                    user.setCorrectOutcomes((user.getCorrectOutcomes() != null ? user.getCorrectOutcomes() : 0) + 1);
                } else if (Integer.signum(actualHome - actualAway) == Integer.signum(predHome - predAway)) {
                    user.setCorrectOutcomes((user.getCorrectOutcomes() != null ? user.getCorrectOutcomes() : 0) + 1);
                }
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
            int[] streaks = calculateStreaks(user.getId(), allPreds, allFinishedMatches);
            user.setCurrentStreak(streaks[0]);
            user.setLongestStreak(streaks[1]);
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
