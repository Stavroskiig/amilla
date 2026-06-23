package com.amilla.application.service;

import com.amilla.adapters.inbound.web.dto.GlobalStatsDto;
import com.amilla.domain.model.LongTermPrediction;
import com.amilla.domain.model.Match;
import com.amilla.domain.model.Prediction;
import com.amilla.domain.model.User;
import com.amilla.ports.outbound.LongTermPredictionRepositoryPort;
import com.amilla.ports.outbound.MatchRepositoryPort;
import com.amilla.ports.outbound.PredictionRepositoryPort;
import com.amilla.ports.outbound.UserRepositoryPort;
import com.amilla.ports.outbound.UserRankHistoryRepositoryPort;
import com.amilla.domain.model.UserRankHistory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class StatsService {

        private final UserRepositoryPort userRepository;
        private final MatchRepositoryPort matchRepository;
        private final PredictionRepositoryPort predictionRepository;
        private final LongTermPredictionRepositoryPort longTermPredictionRepository;
        private final UserRankHistoryRepositoryPort userRankHistoryRepository;

        public StatsService(UserRepositoryPort userRepository,
                        MatchRepositoryPort matchRepository,
                        PredictionRepositoryPort predictionRepository,
                        LongTermPredictionRepositoryPort longTermPredictionRepository,
                        UserRankHistoryRepositoryPort userRankHistoryRepository) {
                this.userRepository = userRepository;
                this.matchRepository = matchRepository;
                this.predictionRepository = predictionRepository;
                this.longTermPredictionRepository = longTermPredictionRepository;
                this.userRankHistoryRepository = userRankHistoryRepository;
        }

        public GlobalStatsDto getGlobalStats() {
                List<User> users = userRepository.findAll();
                List<Match> matches = matchRepository.findAll();
                List<Prediction> predictions = predictionRepository.findAll();
                List<LongTermPrediction> longTermPredictions = longTermPredictionRepository.findAll();

                GlobalStatsDto stats = new GlobalStatsDto();

                // 1. Community Pulse
                stats.setChampionDistribution(calculateChampionDistribution(longTermPredictions));
                stats.setMostCommonScoreline(calculateMostCommonScoreline(predictions));

                // 2. Match Superlatives
                calculateMatchSuperlatives(stats, matches, predictions, users.size());

                // 3. Hall of Fame
                calculateHallOfFame(stats, users, predictions);

                // Additional Stats (Hall of Fame additions & Hall of Shame)
                calculateAdditionalStats(stats, users, predictions, matches);
                
                // Golden Predictions
                calculateGoldenPredictions(stats, users, predictions, matches);

                // 4. Global Averages
                calculateGlobalAverages(stats, predictions, users);

                // 5. Prediction Matrix
                calculatePredictionMatrix(stats, matches, predictions, users);

                // 6. Player Comparisons
                calculatePlayerComparisons(stats, users, predictions, matches);

                return stats;
        }

        private void calculatePredictionMatrix(GlobalStatsDto stats, List<Match> matches, List<Prediction> predictions,
                        List<User> users) {
                // Prepare players (sorted by points desc)
                List<GlobalStatsDto.PlayerHeaderDto> playerHeaders = users.stream()
                                .sorted(Comparator.comparingInt(User::getTotalPoints).reversed())
                                .map(u -> GlobalStatsDto.PlayerHeaderDto.builder()
                                                .id(u.getId().toString())
                                                .username(u.getUsername())
                                                .avatar(u.getAvatar())
                                                .totalPoints(u.getTotalPoints())
                                                .build())
                                .collect(Collectors.toList());

                // Prepare matches (only locked ones, sorted by kickoff time desc)
                java.time.Instant now = java.time.Instant.now();
                List<Match> lockedMatches = matches.stream()
                                .filter(m -> m.getKickoffTime() != null
                                                && now.isAfter(m.getKickoffTime().minus(5,
                                                                java.time.temporal.ChronoUnit.MINUTES)))
                                .sorted(Comparator.comparing(Match::getKickoffTime).reversed())
                                .collect(Collectors.toList());

                List<GlobalStatsDto.MatchRowDto> matchRows = new ArrayList<>();
                for (Match m : lockedMatches) {
                        Map<String, GlobalStatsDto.PredictionCellDto> cells = new HashMap<>();

                        // Get all predictions for this match, sorted by updatedAt so latest overwrites
                        // earlier ones
                        List<Prediction> matchPreds = predictions.stream()
                                        .filter(p -> p.getMatchId().equals(m.getId()))
                                        .sorted(Comparator
                                                        .comparing(p -> p.getUpdatedAt() == null ? java.time.Instant.MIN
                                                                        : p.getUpdatedAt()))
                                        .collect(Collectors.toList());

                        for (Prediction p : matchPreds) {
                                cells.put(p.getUserId().toString(), GlobalStatsDto.PredictionCellDto.builder()
                                                .homeScore(p.getPredictedHomeScore())
                                                .awayScore(p.getPredictedAwayScore())
                                                .pointsEarned(p.getPointsEarned())
                                                .build());
                        }

                        matchRows.add(GlobalStatsDto.MatchRowDto.builder()
                                        .matchId(m.getId())
                                        .homeTeam(m.getHomeTeam())
                                        .awayTeam(m.getAwayTeam())
                                        .homeScore(m.getHomeScore90())
                                        .awayScore(m.getAwayScore90())
                                        .matchStage(m.getMatchStage())
                                        .status(m.getStatus())
                                        .kickoffTime(m.getKickoffTime())
                                        .predictions(cells)
                                        .build());
                }

                stats.setPredictionMatrix(GlobalStatsDto.PredictionMatrixDto.builder()
                                .players(playerHeaders)
                                .matches(matchRows)
                                .build());
        }

        private Map<String, Double> calculateChampionDistribution(List<LongTermPrediction> preds) {
                if (preds.isEmpty())
                        return Collections.emptyMap();
                Map<String, Long> counts = preds.stream()
                                .filter(p -> p.getPredictedChampionTeam() != null)
                                .collect(Collectors.groupingBy(LongTermPrediction::getPredictedChampionTeam,
                                                Collectors.counting()));

                long total = preds.size();
                Map<String, Double> dist = new HashMap<>();
                counts.forEach((team, count) -> dist.put(team, Math.round((count * 100.0 / total) * 10.0) / 10.0));

                return dist.entrySet().stream()
                                .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue, (e1, e2) -> e1,
                                                LinkedHashMap::new));
        }

        private String calculateMostCommonScoreline(List<Prediction> preds) {
                if (preds.isEmpty())
                        return "N/A";
                Map<String, Long> counts = preds.stream()
                                .map(p -> {
                                        int h = p.getPredictedHomeScore();
                                        int a = p.getPredictedAwayScore();
                                        return Math.max(h, a) + " - " + Math.min(h, a);
                                })
                                .collect(Collectors.groupingBy(s -> s, Collectors.counting()));

                return counts.entrySet().stream()
                                .max(Map.Entry.comparingByValue())
                                .map(e -> e.getKey() + " (" + e.getValue() + " φορές)")
                                .orElse("N/A");
        }

        private void calculateMatchSuperlatives(GlobalStatsDto stats, List<Match> matches, List<Prediction> predictions,
                        int totalUsers) {
                if (totalUsers == 0)
                        return;

                List<Match> finishedMatches = matches.stream()
                                .filter(m -> "FINISHED".equalsIgnoreCase(m.getStatus()))
                                .collect(Collectors.toList());

                Map<String, List<Prediction>> predsByMatch = predictions.stream()
                                .collect(Collectors.groupingBy(Prediction::getMatchId));

                GlobalStatsDto.MatchStatDto mostPredictable = null;
                GlobalStatsDto.MatchStatDto biggestUpset = null;
                double highestRate = -1.0;
                double lowestRate = Double.MAX_VALUE;
                
                List<GlobalStatsDto.MatchStatDto> zeroSuccessList = new ArrayList<>();

                for (Match m : finishedMatches) {
                        List<Prediction> matchPreds = predsByMatch.getOrDefault(m.getId(), Collections.emptyList());
                        if (matchPreds.isEmpty())
                                continue;

                        Integer homeScore = m.getHomeScore90();
                        Integer awayScore = m.getAwayScore90();
                        if (homeScore == null || awayScore == null)
                                continue;

                        long exactCount = matchPreds.stream().filter(p -> p.getPredictedHomeScore() == homeScore &&
                                        p.getPredictedAwayScore() == awayScore).count();

                        long correctResultCount = matchPreds.stream().filter(p -> {
                                if (p.getPredictedHomeScore() == homeScore && p.getPredictedAwayScore() == awayScore)
                                        return false;
                                return Integer.signum(p.getPredictedHomeScore() - p.getPredictedAwayScore()) == Integer
                                                .signum(homeScore - awayScore);
                        }).count();

                        double predictabilityScore = (exactCount * 3.0 + correctResultCount * 1.0) / matchPreds.size();
                        double successRate = predictabilityScore / 3.0;

                        double sumPts = matchPreds.stream().mapToInt(Prediction::getPointsEarned).sum();
                        double avgPts = sumPts / (double) matchPreds.size();

                        GlobalStatsDto.MatchStatDto dto = GlobalStatsDto.MatchStatDto.builder()
                                        .matchId(m.getId())
                                        .homeTeam(m.getHomeTeam())
                                        .awayTeam(m.getAwayTeam())
                                        .homeScore(m.getHomeScore90())
                                        .awayScore(m.getAwayScore90())
                                        .averagePoints(Math.round(avgPts * 10.0) / 10.0)
                                        .exactPredictions((int) exactCount)
                                        .correctResultPredictions((int) correctResultCount)
                                        .totalPredictions(matchPreds.size())
                                        .correctPercentage(Math.round(successRate * 1000.0) / 10.0)
                                        .build();

                        if (successRate > highestRate) {
                                highestRate = successRate;
                                mostPredictable = dto;
                        } else if (successRate == highestRate && mostPredictable != null) {
                                if (exactCount > mostPredictable.getExactPredictions()) {
                                        mostPredictable = dto;
                                } else if (exactCount == mostPredictable.getExactPredictions()
                                                && correctResultCount > mostPredictable.getCorrectResultPredictions()) {
                                        mostPredictable = dto;
                                }
                        }

                        if (exactCount == 0 && correctResultCount == 0) {
                            zeroSuccessList.add(dto);
                        } else {
                            if (successRate < lowestRate) {
                                    lowestRate = successRate;
                                    biggestUpset = dto;
                            } else if (successRate == lowestRate && biggestUpset != null) {
                                    if (matchPreds.size() > biggestUpset.getTotalPredictions()) {
                                            biggestUpset = dto;
                                    }
                            }
                        }
                }

                stats.setMostPredictableMatch(mostPredictable);
                stats.setZeroSuccessMatches(zeroSuccessList);

                // Only set biggest upset if we have more than one finished match (to avoid
                // duplicating the same match)
                if (finishedMatches.size() > 1) {
                        stats.setBiggestUpset(biggestUpset);
                }
        }

        private void calculateHallOfFame(GlobalStatsDto stats, List<User> users, List<Prediction> predictions) {
                if (users.isEmpty())
                        return;

                // The Oracle (highest exact hits)
                User oracle = users.stream()
                                .max(Comparator.comparingInt(u -> u.getExactHits() != null ? u.getExactHits() : 0))
                                .orElse(null);
                if (oracle != null && oracle.getExactHits() != null && oracle.getExactHits() > 0) {
                        stats.setTheOracle(GlobalStatsDto.UserStatDto.builder()
                                        .username(oracle.getUsername())
                                        .avatar(oracle.getAvatar())
                                        .statValue(oracle.getExactHits() + (oracle.getExactHits() == 1 ? " ακριβές σκορ"
                                                        : " ακριβή σκορ"))
                                        .build());
                }

                // Mr. Consistent (longest streak)
                User consistent = users.stream()
                                .max(Comparator.comparingInt(
                                                u -> u.getLongestStreak() != null ? u.getLongestStreak() : 0))
                                .orElse(null);
                if (consistent != null && consistent.getLongestStreak() != null && consistent.getLongestStreak() > 0) {
                        stats.setMrConsistent(GlobalStatsDto.UserStatDto.builder()
                                        .username(consistent.getUsername())
                                        .avatar(consistent.getAvatar())
                                        .statValue(consistent.getLongestStreak()
                                                        + (consistent.getLongestStreak() == 1 ? " σερί επιτυχία"
                                                                        : " σερί επιτυχίες"))
                                        .build());
                }

                // Highest Scorer
                User highestScorer = users.stream()
                                .max(Comparator.comparingInt(User::getTotalPoints))
                                .orElse(null);
                if (highestScorer != null && highestScorer.getTotalPoints() > 0) {
                        stats.setHighestScorer(GlobalStatsDto.UserStatDto.builder()
                                        .username(highestScorer.getUsername())
                                        .avatar(highestScorer.getAvatar())
                                        .statValue(highestScorer.getTotalPoints()
                                                        + (highestScorer.getTotalPoints() == 1 ? " πόντος" : " πόντοι"))
                                        .build());
                }

                // The Flash (fastest submitter based on time before kickoff)
                if (predictions != null && !predictions.isEmpty()) {
                        Map<String, Match> matchMap = matchRepository.findAll().stream()
                                        .collect(Collectors.toMap(Match::getId, m -> m));

                        Map<String, List<Prediction>> predsByUser = predictions.stream()
                                        .filter(p -> p.getUpdatedAt() != null && matchMap.containsKey(p.getMatchId())
                                                        && matchMap.get(p.getMatchId()).getKickoffTime() != null)
                                        .collect(Collectors.groupingBy(p -> p.getUserId().toString()));

                        User flash = null;
                        double minAvgHoursAfterUnlock = Double.MAX_VALUE;

                        for (User u : users) {
                                List<Prediction> userPreds = predsByUser.getOrDefault(u.getId().toString(),
                                                Collections.emptyList());
                                if (userPreds.isEmpty())
                                        continue;

                                double totalHours = 0;
                                int validCount = 0;
                                for (Prediction p : userPreds) {
                                        if (p.getCreatedAt() == null)
                                                continue; // Ignore legacy predictions

                                        Match m = matchMap.get(p.getMatchId());
                                        java.time.Instant unlockTime = m.getKickoffTime().minus(24,
                                                        java.time.temporal.ChronoUnit.HOURS);
                                        java.time.Duration duration = java.time.Duration.between(unlockTime,
                                                        p.getCreatedAt());

                                        // If duration is negative, it means they somehow submitted before unlock (e.g.
                                        // admin or before rule added). Let's clamp to 0 or count it.
                                        double hours = Math.max(0, duration.toMillis() / 3600000.0);
                                        totalHours += hours;
                                        validCount++;
                                }

                                if (validCount > 0) {
                                        double avgHours = totalHours / validCount;
                                        if (avgHours < minAvgHoursAfterUnlock) {
                                                minAvgHoursAfterUnlock = avgHours;
                                                flash = u;
                                        }
                                }
                        }

                        if (flash != null && minAvgHoursAfterUnlock < Double.MAX_VALUE) {
                                String timeStr;
                                if (minAvgHoursAfterUnlock < 1.0) {
                                        timeStr = String.format("πρόβλεψη σε ~%.0f λεπτά", minAvgHoursAfterUnlock * 60);
                                } else {
                                        timeStr = String.format("πρόβλεψη σε ~%.1f ώρες", minAvgHoursAfterUnlock);
                                }

                                stats.setTheFlash(GlobalStatsDto.UserStatDto.builder()
                                                .username(flash.getUsername())
                                                .avatar(flash.getAvatar())
                                                .statValue(timeStr)
                                                .build());
                        }
                }

                // The Soulmates (most identical predictions)
                if (users.size() >= 2 && predictions != null && !predictions.isEmpty()) {
                        Map<String, List<Prediction>> predsByUser = predictions.stream()
                                        .collect(Collectors.groupingBy(p -> p.getUserId().toString()));

                        int maxIdentical = 0;
                        User soulmate1 = null;
                        User soulmate2 = null;

                        for (int i = 0; i < users.size(); i++) {
                                for (int j = i + 1; j < users.size(); j++) {
                                        User u1 = users.get(i);
                                        User u2 = users.get(j);

                                        List<Prediction> list1 = predsByUser.getOrDefault(u1.getId().toString(),
                                                        Collections.emptyList());
                                        List<Prediction> list2 = predsByUser.getOrDefault(u2.getId().toString(),
                                                        Collections.emptyList());

                                        Map<String, Prediction> map2 = list2.stream()
                                                        .collect(Collectors.toMap(Prediction::getMatchId, p -> p,
                                                                        (p1, p2) -> p2));

                                        int identicalCount = 0;
                                        for (Prediction p1 : list1) {
                                                Prediction p2 = map2.get(p1.getMatchId());
                                                if (p2 != null &&
                                                                p1.getPredictedHomeScore() == p2.getPredictedHomeScore()
                                                                &&
                                                                p1.getPredictedAwayScore() == p2
                                                                                .getPredictedAwayScore()) {
                                                        identicalCount++;
                                                }
                                        }

                                        if (identicalCount > maxIdentical) {
                                                maxIdentical = identicalCount;
                                                soulmate1 = u1;
                                                soulmate2 = u2;
                                        }
                                }
                        }

                        if (maxIdentical > 0 && soulmate1 != null && soulmate2 != null) {
                                stats.setSoulmates(GlobalStatsDto.UserPairStatDto.builder()
                                                .username1(soulmate1.getUsername())
                                                .avatar1(soulmate1.getAvatar())
                                                .username2(soulmate2.getUsername())
                                                .avatar2(soulmate2.getAvatar())
                                                .statValue(maxIdentical + (maxIdentical == 1 ? " κοινή πρόβλεψη"
                                                                : " κοινές προβλέψεις"))
                                                .build());
                        }
                }
        }

        private void calculateGlobalAverages(GlobalStatsDto stats, List<Prediction> predictions, List<User> users) {
                if (predictions.isEmpty()) {
                        stats.setAveragePointsPerPrediction(0.0);
                        stats.setTotalExactScores(0L);
                        stats.setTotalCorrectResults(0L);
                        stats.setTotalMisses(0L);
                        return;
                }

                Map<String, Match> finishedMatchesMap = matchRepository.findAll().stream()
                                .filter(m -> "FINISHED".equalsIgnoreCase(m.getStatus()))
                                .collect(Collectors.toMap(Match::getId, m -> m));

                List<Prediction> finishedPreds = predictions.stream()
                                .filter(p -> finishedMatchesMap.containsKey(p.getMatchId()))
                                .collect(Collectors.toList());

                double avgPoints = finishedPreds.isEmpty() ? 0.0
                                : finishedPreds.stream()
                                                .mapToInt(Prediction::getPointsEarned)
                                                .average()
                                                .orElse(0.0);
                stats.setAveragePointsPerPrediction(Math.round(avgPoints * 100.0) / 100.0);

                long exactF = finishedPreds.stream().filter(p -> {
                        Match m = finishedMatchesMap.get(p.getMatchId());
                        return m != null && m.getHomeScore90() != null && m.getAwayScore90() != null &&
                                        p.getPredictedHomeScore() == m.getHomeScore90() &&
                                        p.getPredictedAwayScore() == m.getAwayScore90();
                }).count();

                long correctF = finishedPreds.stream().filter(p -> {
                        Match m = finishedMatchesMap.get(p.getMatchId());
                        if (m == null || m.getHomeScore90() == null || m.getAwayScore90() == null)
                                return false;
                        return Integer.signum(m.getHomeScore90() - m.getAwayScore90()) == Integer
                                        .signum(p.getPredictedHomeScore() - p.getPredictedAwayScore());
                }).count();

                long missF = finishedPreds.size() - correctF;

                stats.setTotalExactScores(exactF);
                stats.setTotalCorrectResults(correctF);
                stats.setTotalMisses(missF);
        }

        private void calculatePlayerComparisons(GlobalStatsDto stats, List<User> users, List<Prediction> predictions,
                        List<Match> matches) {
                Map<String, Match> finishedMatchesMap = matches.stream()
                                .filter(m -> "FINISHED".equalsIgnoreCase(m.getStatus()))
                                .collect(Collectors.toMap(Match::getId, m -> m));

                List<GlobalStatsDto.PlayerAvgPointsDto> avgPointsList = new ArrayList<>();

                for (User u : users) {
                        List<Prediction> userFinishedPreds = predictions.stream()
                                        .filter(p -> p.getUserId().equals(u.getId())
                                                        && finishedMatchesMap.containsKey(p.getMatchId()))
                                        .collect(Collectors.toList());

                        if (!userFinishedPreds.isEmpty()) {
                                double avg = userFinishedPreds.stream().mapToInt(Prediction::getPointsEarned).average()
                                                .orElse(0.0);
                                avgPointsList.add(GlobalStatsDto.PlayerAvgPointsDto.builder()
                                                .username(u.getUsername())
                                                .avatar(u.getAvatar())
                                                .averagePoints(Math.round(avg * 100.0) / 100.0)
                                                .build());
                        } else {
                                avgPointsList.add(GlobalStatsDto.PlayerAvgPointsDto.builder()
                                                .username(u.getUsername())
                                                .avatar(u.getAvatar())
                                                .averagePoints(0.0)
                                                .build());
                        }
                }

                // Sort descending by average points
                avgPointsList.sort(
                                Comparator.comparing(GlobalStatsDto.PlayerAvgPointsDto::getAveragePoints).reversed());
                stats.setPlayerAveragePoints(avgPointsList);
        }

        private void calculateAdditionalStats(GlobalStatsDto stats, List<User> users, List<Prediction> predictions,
                        List<Match> matches) {
                if (users.isEmpty())
                        return;

                Map<String, Match> finishedMatchesMap = matches.stream()
                                .filter(m -> "FINISHED".equalsIgnoreCase(m.getStatus()))
                                .collect(Collectors.toMap(Match::getId, m -> m));

                List<Prediction> finishedPreds = predictions.stream()
                                .filter(p -> finishedMatchesMap.containsKey(p.getMatchId()))
                                .collect(Collectors.toList());

                // --- 1. The Underdog Hunter ---
                // For each finished match, calculate if >=90% of predictions got 0 points.
                Map<String, Integer> underdogPoints = new HashMap<>();
                Map<String, List<Prediction>> predsByMatch = finishedPreds.stream()
                                .collect(Collectors.groupingBy(Prediction::getMatchId));

                for (Map.Entry<String, List<Prediction>> entry : predsByMatch.entrySet()) {
                        List<Prediction> matchPreds = entry.getValue();
                        long zeroPointsCount = matchPreds.stream().filter(p -> p.getPointsEarned() == 0).count();
                        if (matchPreds.size() > 0 && ((double) zeroPointsCount / matchPreds.size()) >= 0.9) {
                                // Find users who got > 0 points
                                for (Prediction p : matchPreds) {
                                        if (p.getPointsEarned() > 0) {
                                                underdogPoints.merge(p.getUserId().toString(), 1, (a, b) -> a + b);
                                        }
                                }
                        }
                }

                String bestUnderdogId = underdogPoints.entrySet().stream()
                                .max(Map.Entry.comparingByValue())
                                .map(Map.Entry::getKey).orElse(null);

                if (bestUnderdogId != null) {
                        User u = users.stream().filter(user -> user.getId().toString().equals(bestUnderdogId))
                                        .findFirst().orElse(null);
                        if (u != null) {
                                int val = underdogPoints.get(bestUnderdogId);
                                stats.setUnderdogHunter(GlobalStatsDto.UserStatDto.builder()
                                                .username(u.getUsername())
                                                .avatar(u.getAvatar())
                                                .statValue(val + (val == 1 ? " φορά" : " φορές"))
                                                .build());
                        }
                }

                // --- 2. King of the Bucket (Most 0-point matches) ---
                Map<String, List<Prediction>> predsByUser = finishedPreds.stream()
                                .collect(Collectors.groupingBy(p -> p.getUserId().toString()));

                String bestBucketId = null;
                double maxBucketPct = -1.0;
                int maxBucketCount = 0;

                for (Map.Entry<String, List<Prediction>> entry : predsByUser.entrySet()) {
                        List<Prediction> upreds = entry.getValue();
                        int zeroCount = (int) upreds.stream().filter(p -> p.getPointsEarned() == 0).count();
                        if (upreds.size() > 0) {
                                double pct = (double) zeroCount / upreds.size();
                                if (pct > maxBucketPct || (pct == maxBucketPct && zeroCount > maxBucketCount)) {
                                        maxBucketPct = pct;
                                        maxBucketCount = zeroCount;
                                        bestBucketId = entry.getKey();
                                }
                        }
                }

                if (bestBucketId != null && maxBucketCount > 0) {
                        String finalBestBucketId = bestBucketId;
                        User u = users.stream().filter(user -> user.getId().toString().equals(finalBestBucketId))
                                        .findFirst().orElse(null);
                        if (u != null) {
                                int pctInt = (int) Math.round(maxBucketPct * 100);
                                stats.setKingOfBucket(GlobalStatsDto.UserStatDto.builder()
                                                .username(u.getUsername())
                                                .avatar(u.getAvatar())
                                                .statValue(maxBucketCount + " αγώνες (" + pctInt + "%)")
                                                .build());
                        }
                }

                // --- 3. Near Miss (Παρά Τρίχα) ---
                Map<String, Integer> nearMissCount = new HashMap<>();
                for (Prediction p : finishedPreds) {
                        Match m = finishedMatchesMap.get(p.getMatchId());
                        if (m != null && m.getHomeScore90() != null && m.getAwayScore90() != null) {
                                int diff = Math.abs(p.getPredictedHomeScore() - m.getHomeScore90()) +
                                                Math.abs(p.getPredictedAwayScore() - m.getAwayScore90());
                                if (diff == 1) {
                                        nearMissCount.merge(p.getUserId().toString(), 1, (a, b) -> a + b);
                                }
                        }
                }

                String bestNearMissId = nearMissCount.entrySet().stream()
                                .max(Map.Entry.comparingByValue())
                                .map(Map.Entry::getKey).orElse(null);

                if (bestNearMissId != null) {
                        User u = users.stream().filter(user -> user.getId().toString().equals(bestNearMissId))
                                        .findFirst().orElse(null);
                        if (u != null) {
                                int val = nearMissCount.get(bestNearMissId);
                                stats.setNearMiss(GlobalStatsDto.UserStatDto.builder()
                                                .username(u.getUsername())
                                                .avatar(u.getAvatar())
                                                .statValue(val + (val == 1 ? " φορά" : " φορές"))
                                                .build());
                        }
                }

                // --- 4. Anti-Prophet (Αντι-Προφήτης) ---
                Map<String, Integer> antiProphetCount = new HashMap<>();
                for (Prediction p : finishedPreds) {
                        Match m = finishedMatchesMap.get(p.getMatchId());
                        if (m != null && m.getHomeScore90() != null && m.getAwayScore90() != null) {
                                int predSign = Integer.signum(p.getPredictedHomeScore() - p.getPredictedAwayScore());
                                int actSign = Integer.signum(m.getHomeScore90() - m.getAwayScore90());
                                // Only count if one predicted team A, and team B won (or vice versa).
                                // i.e. 1 vs -1 or -1 vs 1. 1 * -1 = -1.
                                if (predSign * actSign == -1) {
                                        antiProphetCount.merge(p.getUserId().toString(), 1, (a, b) -> a + b);
                                }
                        }
                }

                String bestAntiProphetId = antiProphetCount.entrySet().stream()
                                .max(Map.Entry.comparingByValue())
                                .map(Map.Entry::getKey).orElse(null);

                if (bestAntiProphetId != null) {
                        User u = users.stream().filter(user -> user.getId().toString().equals(bestAntiProphetId))
                                        .findFirst().orElse(null);
                        if (u != null) {
                                int val = antiProphetCount.get(bestAntiProphetId);
                                stats.setAntiProphet(GlobalStatsDto.UserStatDto.builder()
                                                .username(u.getUsername())
                                                .avatar(u.getAvatar())
                                                .statValue(val + (val == 1 ? " φορά" : " φορές"))
                                                .build());
                        }
                }

                // --- 5. Icarus (Ικαρος) ---
                List<UserRankHistory> rankHistories = userRankHistoryRepository.findAll();
                Map<String, List<UserRankHistory>> historyByUser = rankHistories.stream()
                                .collect(Collectors.groupingBy(h -> h.getUserId().toString()));

                String bestIcarusId = null;
                int maxRankDrop = 0;

                for (Map.Entry<String, List<UserRankHistory>> entry : historyByUser.entrySet()) {
                        List<UserRankHistory> userHistory = entry.getValue();
                        userHistory.sort(Comparator.comparing(UserRankHistory::getCreatedAt));

                        int currentMaxDrop = 0;
                        for (int i = 0; i < userHistory.size(); i++) {
                                UserRankHistory start = userHistory.get(i);
                                // User asked to exclude random initial standings with 0 points
                                if (start.getPoints() <= 0)
                                        continue;

                                for (int j = i + 1; j < userHistory.size(); j++) {
                                        UserRankHistory end = userHistory.get(j);
                                        int drop = end.getRank() - start.getRank();
                                        if (drop > currentMaxDrop) {
                                                currentMaxDrop = drop;
                                        }
                                }
                        }

                        if (currentMaxDrop > maxRankDrop) {
                                maxRankDrop = currentMaxDrop;
                                bestIcarusId = entry.getKey();
                        }
                }

                if (bestIcarusId != null && maxRankDrop > 0) {
                        String finalBestIcarusId = bestIcarusId;
                        User u = users.stream().filter(user -> user.getId().toString().equals(finalBestIcarusId))
                                        .findFirst().orElse(null);
                        if (u != null) {
                                stats.setIcarus(GlobalStatsDto.UserStatDto.builder()
                                                .username(u.getUsername())
                                                .avatar(u.getAvatar())
                                                .statValue(maxRankDrop + (maxRankDrop == 1 ? " θέσης" : " θέσεων"))
                                                .build());
                        }
                }
        }
        
        private void calculateGoldenPredictions(GlobalStatsDto stats, List<User> users, List<Prediction> predictions, List<Match> matches) {
                Map<String, Match> finishedMatchesMap = matches.stream()
                                .filter(m -> "FINISHED".equalsIgnoreCase(m.getStatus()))
                                .collect(Collectors.toMap(Match::getId, m -> m));
                                
                Map<String, User> userMap = users.stream().collect(Collectors.toMap(u -> u.getId().toString(), u -> u));

                Map<String, List<Prediction>> predsByMatch = predictions.stream()
                                .collect(Collectors.groupingBy(Prediction::getMatchId));

                List<GlobalStatsDto.GoldenPredictionDto> goldenList = new ArrayList<>();

                for (Map.Entry<String, List<Prediction>> entry : predsByMatch.entrySet()) {
                        Match m = finishedMatchesMap.get(entry.getKey());
                        if (m == null || m.getHomeScore90() == null || m.getAwayScore90() == null) continue;

                        List<GlobalStatsDto.UserStatDto> matchGoldenUsers = new ArrayList<>();
                        Integer points = 0;

                        for (Prediction p : entry.getValue()) {
                                if (p.getPredictedHomeScore() == m.getHomeScore90() && p.getPredictedAwayScore() == m.getAwayScore90()) {
                                        User u = userMap.get(p.getUserId().toString());
                                        if (u != null && p.getPointsEarned() > 0) {
                                                points = p.getPointsEarned();
                                                matchGoldenUsers.add(GlobalStatsDto.UserStatDto.builder()
                                                        .username(u.getUsername())
                                                        .avatar(u.getAvatar())
                                                        .build());
                                        }
                                }
                        }

                        if (!matchGoldenUsers.isEmpty()) {
                                goldenList.add(GlobalStatsDto.GoldenPredictionDto.builder()
                                        .matchId(m.getId())
                                        .homeTeam(m.getHomeTeam())
                                        .awayTeam(m.getAwayTeam())
                                        .homeScore(m.getHomeScore90())
                                        .awayScore(m.getAwayScore90())
                                        .pointsEarned(points)
                                        .users(matchGoldenUsers)
                                        .build());
                        }
                }

                // Sort by pointsEarned descending, take top 3
                goldenList.sort(Comparator.comparing(GlobalStatsDto.GoldenPredictionDto::getPointsEarned).reversed());
                if (goldenList.size() > 3) {
                        goldenList = goldenList.subList(0, 3);
                }

                stats.setGoldenPredictions(goldenList);
        }
}
