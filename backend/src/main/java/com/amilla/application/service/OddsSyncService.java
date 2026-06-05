package com.amilla.application.service;

import com.amilla.domain.model.Match;
import com.amilla.ports.outbound.MatchRepositoryPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@Service
public class OddsSyncService {

    private final MatchRepositoryPort matchRepositoryPort;
    private final RestTemplate restTemplate;

    @Value("${odds.api.key:3111829a8f097680c7cd3f10217454d7e45aa60e64e0c8122ee322b8f136499c}")
    private String apiKey;

    @Value("${odds.api.url:https://api.odds-api.io/v3}")
    private String apiUrl;

    public OddsSyncService(MatchRepositoryPort matchRepositoryPort) {
        this.matchRepositoryPort = matchRepositoryPort;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Runs every 6 hours to fetch odds for scheduled matches.
     */
    @Scheduled(fixedRate = 21600000)
    public void syncOdds() {
        System.out.println("Starting Odds Sync Scheduler...");
        List<Match> matches = matchRepositoryPort.findAll();
        boolean updated = false;

        try {
            // 1. Fetch upcoming football events to get the event IDs
            String eventsUrl = apiUrl + "/events?sport=football&apiKey=" + apiKey;
            ResponseEntity<List<Map<String, Object>>> eventsResponse = restTemplate.exchange(
                    eventsUrl, HttpMethod.GET, null, new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            List<Map<String, Object>> events = eventsResponse.getBody();
            if (events == null || events.isEmpty()) return;

            // Map home+away to eventId
            Map<String, Long> eventIdMap = new HashMap<>();
            for (Map<String, Object> event : events) {
                String home = (String) event.get("home");
                String away = (String) event.get("away");
                Number eventIdNum = (Number) event.get("id");
                if (home != null && away != null && eventIdNum != null) {
                    eventIdMap.put(home.toLowerCase() + "|" + away.toLowerCase(), eventIdNum.longValue());
                }
            }

            for (Match match : matches) {
                if ("SCHEDULED".equals(match.getStatus())) {
                    String key = match.getHomeTeam().toLowerCase() + "|" + match.getAwayTeam().toLowerCase();
                    Long eventId = eventIdMap.get(key);

                    if (eventId != null) {
                        try {
                            // 2. Fetch odds for this specific event
                            String oddsUrl = apiUrl + "/odds?sport=football&eventId=" + eventId + "&apiKey=" + apiKey;
                            Map<String, Object> oddsResponse = restTemplate.getForObject(oddsUrl, Map.class);

                            if (oddsResponse != null && oddsResponse.containsKey("bookmakers")) {
                                Map<String, List<Map<String, Object>>> bookmakers = (Map<String, List<Map<String, Object>>>) oddsResponse.get("bookmakers");
                                
                                if (!bookmakers.isEmpty()) {
                                    // Use the first available bookmaker for simplicity
                                    List<Map<String, Object>> markets = bookmakers.values().iterator().next();
                                    
                                    for (Map<String, Object> market : markets) {
                                        String marketName = (String) market.get("name");
                                        List<Map<String, Object>> oddsList = (List<Map<String, Object>>) market.get("odds");
                                        
                                        if (oddsList != null && !oddsList.isEmpty()) {
                                            Map<String, Object> odds = oddsList.get(0);
                                            
                                            if ("ML".equals(marketName)) {
                                                if (odds.containsKey("home")) match.setHomeOdds(Double.parseDouble(String.valueOf(odds.get("home"))));
                                                if (odds.containsKey("draw")) match.setDrawOdds(Double.parseDouble(String.valueOf(odds.get("draw"))));
                                                if (odds.containsKey("away")) match.setAwayOdds(Double.parseDouble(String.valueOf(odds.get("away"))));
                                            } 
                                            else if ("Correct Score".equals(marketName)) {
                                                ObjectMapper mapper = new ObjectMapper();
                                                match.setExactScoreOddsJson(mapper.writeValueAsString(odds));
                                            }
                                        }
                                    }
                                    updated = true;
                                }
                            }
                        } catch (Exception e) {
                            System.err.println("Failed to fetch odds for event " + eventId + ": " + e.getMessage());
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch events from odds API: " + e.getMessage());
        }

        if (updated) {
            matchRepositoryPort.saveAll(matches);
            System.out.println("Odds synchronized successfully.");
        }
    }
}
