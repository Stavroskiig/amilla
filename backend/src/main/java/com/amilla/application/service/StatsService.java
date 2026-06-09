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

        public StatsService(UserRepositoryPort userRepository,
                        MatchRepositoryPort matchRepository,
                        PredictionRepositoryPort predictionRepository,
                        LongTermPredictionRepositoryPort longTermPredictionRepository) {
                this.userRepository = userRepository;
                this.matchRepository = matchRepository;
                this.predictionRepository = predictionRepository;
                this.longTermPredictionRepository = longTermPredictionRepository;
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
                calculateHallOfFame(stats, users);

                // 4. Global Averages
                calculateGlobalAverages(stats, predictions, users);

                // 5. Prediction Matrix
                calculatePredictionMatrix(stats, matches, predictions, users);

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
                double highestAvg = -1;
                double lowestAvg = Double.MAX_VALUE;

                for (Match m : finishedMatches) {
                        List<Prediction> matchPreds = predsByMatch.getOrDefault(m.getId(), Collections.emptyList());

                        double sumPts = matchPreds.stream().mapToInt(Prediction::getPointsEarned).sum();
                        double avgPts = matchPreds.isEmpty() ? 0.0 : sumPts / (double) matchPreds.size();

                        GlobalStatsDto.MatchStatDto dto = GlobalStatsDto.MatchStatDto.builder()
                                        .matchId(m.getId())
                                        .homeTeam(m.getHomeTeam())
                                        .awayTeam(m.getAwayTeam())
                                        .homeScore(m.getHomeScore90())
                                        .awayScore(m.getAwayScore90())
                                        .averagePoints(Math.round(avgPts * 10.0) / 10.0)
                                        .build();

                        if (avgPts > highestAvg) {
                                highestAvg = avgPts;
                                mostPredictable = dto;
                        }
                        if (avgPts < lowestAvg) {
                                lowestAvg = avgPts;
                                biggestUpset = dto;
                        }
                }

                stats.setMostPredictableMatch(mostPredictable);

                // Only set biggest upset if we have more than one finished match (to avoid
                // duplicating the same match)
                if (finishedMatches.size() > 1) {
                        stats.setBiggestUpset(biggestUpset);
                }
        }

        private void calculateHallOfFame(GlobalStatsDto stats, List<User> users) {
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
                                        .statValue(oracle.getExactHits() + (oracle.getExactHits() == 1 ? " ακριβές σκορ" : " ακριβή σκορ"))
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
                                        .statValue(consistent.getLongestStreak() + (consistent.getLongestStreak() == 1 ? " σερί επιτυχία" : " σερί επιτυχίες"))
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
                                        .statValue(highestScorer.getTotalPoints() + (highestScorer.getTotalPoints() == 1 ? " πόντος" : " πόντοι"))
                                        .build());
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
}
