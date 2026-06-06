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

    public OddsSyncService(MatchRepositoryPort matchRepositoryPort) {
        this.matchRepositoryPort = matchRepositoryPort;
        this.objectMapper = new ObjectMapper();
    }

    public void syncOdds() {
        System.out.println("Starting Local Odds Sync...");
        List<Match> matches = matchRepositoryPort.findAll();
        boolean updated = false;

        try {
            // Read odds-seed.json from resources
            ClassPathResource resource = new ClassPathResource("odds-seed.json");
            if (!resource.exists()) {
                System.out.println("odds-seed.json not found. Please create it in src/main/resources/");
                return;
            }

            try (InputStream is = resource.getInputStream()) {
                List<Map<String, Object>> seededOddsList = objectMapper.readValue(is, new TypeReference<>() {});

                // Create a fast lookup map by match ID
                Map<String, Match> matchMap = matches.stream()
                        .collect(Collectors.toMap(Match::getId, Function.identity()));

                for (Map<String, Object> seededOdds : seededOddsList) {
                    String matchId = (String) seededOdds.get("id");
                    if (matchId == null) continue;

                    Match match = matchMap.get(matchId);
                    if (match != null && "SCHEDULED".equals(match.getStatus())) {
                        
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
        } catch (Exception e) {
            System.err.println("Failed to sync odds from local file: " + e.getMessage());
        }

        if (updated) {
            matchRepositoryPort.saveAll(matches);
            System.out.println("Local Odds synchronized successfully.");
        }
    }
}
