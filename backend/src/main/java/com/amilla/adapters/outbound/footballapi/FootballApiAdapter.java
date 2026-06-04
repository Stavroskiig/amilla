package com.amilla.adapters.outbound.footballapi;

import com.amilla.domain.model.Match;
import com.amilla.ports.outbound.FootballApiPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class FootballApiAdapter implements FootballApiPort {

    private static final Logger log = LoggerFactory.getLogger(FootballApiAdapter.class);

    private final String apiToken;
    private final WebClient webClient;

    public FootballApiAdapter(
            @Value("${amilla.football-api.api-url}") String apiUrl,
            @Value("${amilla.football-api.api-token}") String apiToken,
            WebClient.Builder webClientBuilder) {
        this.apiToken = apiToken;
        this.webClient = webClientBuilder.baseUrl(apiUrl).build();
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<Match> fetchFixturesAndResults() {

        log.info("Fetching matches from live Football API...");
        try {
            // Call Football-Data.org API for World Cup matches (WC)
            Map<String, Object> response = webClient.get()
                    .uri("/competitions/WC/matches")
                    .header("X-Auth-Token", apiToken)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null || !response.containsKey("matches")) {
                log.warn("Empty response or no matches key found in response.");
                return new ArrayList<>();
            }

            List<Map<String, Object>> matchJsonList = (List<Map<String, Object>>) response.get("matches");
            List<Match> matches = new ArrayList<>();

            for (Map<String, Object> matchJson : matchJsonList) {
                try {
                    String id = String.valueOf(matchJson.get("id"));

                    Map<String, Object> homeTeamJson = (Map<String, Object>) matchJson.get("homeTeam");
                    String homeTeam = homeTeamJson != null ? String.valueOf(homeTeamJson.get("name")) : "Home Team";

                    Map<String, Object> awayTeamJson = (Map<String, Object>) matchJson.get("awayTeam");
                    String awayTeam = awayTeamJson != null ? String.valueOf(awayTeamJson.get("name")) : "Away Team";

                    String stage = String.valueOf(matchJson.get("stage")); // e.g. GROUP_STAGE -> map to GROUP
                    if (stage.contains("GROUP")) {
                        stage = "GROUP";
                    }

                    String utcDateStr = String.valueOf(matchJson.get("utcDate"));
                    Instant kickoffTime = Instant.parse(utcDateStr);

                    String statusStr = String.valueOf(matchJson.get("status"));
                    String status = "SCHEDULED";
                    if ("FINISHED".equalsIgnoreCase(statusStr)) {
                        status = "FINISHED";
                    } else if ("IN_PLAY".equalsIgnoreCase(statusStr) || "PAUSED".equalsIgnoreCase(statusStr)) {
                        status = "LIVE";
                    }

                    Integer homeScore = null;
                    Integer awayScore = null;
                    String qualifiedTeam = null;

                    Map<String, Object> scoreJson = (Map<String, Object>) matchJson.get("score");
                    if (scoreJson != null) {
                        Map<String, Object> fullTimeJson = (Map<String, Object>) scoreJson.get("fullTime");
                        if (fullTimeJson != null && fullTimeJson.get("home") != null) {
                            homeScore = ((Number) fullTimeJson.get("home")).intValue();
                        }
                        if (fullTimeJson != null && fullTimeJson.get("away") != null) {
                            awayScore = ((Number) fullTimeJson.get("away")).intValue();
                        }

                        // Determine qualified team for knockouts
                        String winner = String.valueOf(scoreJson.get("winner"));
                        if (!"GROUP".equals(stage) && !"null".equals(winner) && winner != null) {
                            if ("HOME_TEAM".equals(winner)) {
                                qualifiedTeam = homeTeam;
                            } else if ("AWAY_TEAM".equals(winner)) {
                                qualifiedTeam = awayTeam;
                            }
                        }
                    }

                    matches.add(Match.builder()
                            .id(id)
                            .homeTeam(homeTeam)
                            .awayTeam(awayTeam)
                            .matchStage(stage)
                            .kickoffTime(kickoffTime)
                            .homeScore90(homeScore)
                            .awayScore90(awayScore)
                            .qualifiedTeam(qualifiedTeam)
                            .status(status)
                            .build());

                } catch (Exception e) {
                    log.error("Failed to parse match element: {}", matchJson, e);
                }
            }

            return matches;
        } catch (Exception e) {
            log.error("Failed to fetch matches from Football API.", e);
            return new ArrayList<>();
        }
    }
}
