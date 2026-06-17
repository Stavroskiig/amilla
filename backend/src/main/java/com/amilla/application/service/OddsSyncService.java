package com.amilla.application.service;

import com.amilla.domain.model.Match;
import com.amilla.ports.outbound.MatchRepositoryPort;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class OddsSyncService {

    private final MatchRepositoryPort matchRepositoryPort;
    private final ObjectMapper objectMapper;
    private final com.amilla.adapters.outbound.sharpapi.SharpApiClient sharpApiClient;

    public OddsSyncService(MatchRepositoryPort matchRepositoryPort, com.amilla.adapters.outbound.sharpapi.SharpApiClient sharpApiClient) {
        this.matchRepositoryPort = matchRepositoryPort;
        this.sharpApiClient = sharpApiClient;
        this.objectMapper = new ObjectMapper();
    }

    public void syncOdds() {
        System.out.println("Starting Global Odds Sync...");
        List<Match> matches = matchRepositoryPort.findAll();
        boolean updated = false;

        System.out.println("1. Syncing from SharpAPI for linked matches...");
        for (Match match : matches) {
            if ("SCHEDULED".equals(match.getStatus()) && match.getExternalApiId() != null && !match.getExternalApiId().trim().isEmpty()) {
                try {
                    sharpApiClient.fetchAndUpdateOdds(match);
                    match.setAutoOddsFetched(true);
                    updated = true;
                    // SharpAPI Limit is 12 requests / minute. 1500ms allows 40 requests/min, but 5000ms is too slow.
                    // We'll use 5000ms to be perfectly safe, or just 1000ms if we expect small batches.
                    // Let's use 3000ms which is a good balance and handles ~20 matches safely over a minute.
                    Thread.sleep(3000); 
                } catch (Exception e) {
                    System.err.println("Failed to sync odds from SharpAPI for match " + match.getId() + ": " + e.getMessage());
                }
            }
        }

        System.out.println("2. Syncing from local file as fallback...");
        try {
            // Read odds-seed.json from resources
            ClassPathResource resource = new ClassPathResource("odds-seed.json");
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    List<Map<String, Object>> seededOddsList = objectMapper.readValue(is, new TypeReference<>() {});

                    // Create a fast lookup map by match ID
                    Map<String, Match> matchMap = matches.stream()
                            .collect(Collectors.toMap(Match::getId, Function.identity()));

                    for (Map<String, Object> seededOdds : seededOddsList) {
                        String matchId = (String) seededOdds.get("id");
                        if (matchId == null) continue;

                        Match match = matchMap.get(matchId);
                        // Only sync local odds if not already fetched from SharpAPI
                        if (match != null && "SCHEDULED".equals(match.getStatus()) && !Boolean.TRUE.equals(match.getAutoOddsFetched())) {
                            
                            // Parse Moneyline odds
                            if (seededOdds.containsKey("homeOdds")) match.setHomeOdds(Double.parseDouble(String.valueOf(seededOdds.get("homeOdds"))));
                            if (seededOdds.containsKey("drawOdds")) match.setDrawOdds(Double.parseDouble(String.valueOf(seededOdds.get("drawOdds"))));
                            if (seededOdds.containsKey("awayOdds")) match.setAwayOdds(Double.parseDouble(String.valueOf(seededOdds.get("awayOdds"))));

                            // Parse Advance odds
                            if (seededOdds.containsKey("homeAdvanceOdds")) match.setHomeAdvanceOdds(Double.parseDouble(String.valueOf(seededOdds.get("homeAdvanceOdds"))));
                            if (seededOdds.containsKey("awayAdvanceOdds")) match.setAwayAdvanceOdds(Double.parseDouble(String.valueOf(seededOdds.get("awayAdvanceOdds"))));

                            // Parse Exact Score odds
                            if (seededOdds.containsKey("exactScores")) {
                                Object exactScores = seededOdds.get("exactScores");
                                match.setExactScoreOddsJson(objectMapper.writeValueAsString(exactScores));
                            }

                            updated = true;
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to sync odds from local file: " + e.getMessage());
        }

        if (updated) {
            matchRepositoryPort.saveAll(matches);
            System.out.println("Global Odds synchronized successfully.");
        }
    }
}
