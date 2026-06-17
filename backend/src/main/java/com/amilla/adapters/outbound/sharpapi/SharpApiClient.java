package com.amilla.adapters.outbound.sharpapi;

import com.amilla.domain.model.Match;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class SharpApiClient {

    private static final Logger log = LoggerFactory.getLogger(SharpApiClient.class);

    @Value("${sharpapi.key:}")
    private String sharpApiKey;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public SharpApiClient(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    /**
     * Fetches odds from SharpAPI and updates the Match domain model with the new
     * odds.
     */
    public void fetchAndUpdateOdds(Match match) {
        if (match.getExternalApiId() == null || match.getExternalApiId().trim().isEmpty()) {
            log.warn("Match {} has no externalApiId. Skipping SharpAPI fetch.", match.getId());
            return;
        }

        if (sharpApiKey == null || sharpApiKey.trim().isEmpty()) {
            log.warn("SharpAPI key is not configured. Skipping odds fetch for match {}", match.getId());
            return;
        }

        // We use FanDuel as the default sportsbook based on user request
        // Filter by the specific markets we need to avoid pagination limits eating the
        // response
        String url = String.format(
                "https://api.sharpapi.io/api/v1/odds?sport=soccer&sportsbook=fanduel&event=%s&markets=moneyline,correct_score,to_qualify,outright",
                match.getExternalApiId());

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("X-API-Key", sharpApiKey)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                parseAndApplyOdds(response.body(), match);
            } else {
                log.error("Failed to fetch odds from SharpAPI for match {}. Status code: {}, Response: {}",
                        match.getId(), response.statusCode(), response.body());
                throw new RuntimeException("SharpAPI returned status " + response.statusCode());
            }

        } catch (Exception e) {
            log.error("Error occurred while fetching odds for match " + match.getId(), e);
            throw new RuntimeException("Error fetching odds: " + e.getMessage(), e);
        }
    }

    private void parseAndApplyOdds(String jsonBody, Match match) throws Exception {
        JsonNode root = objectMapper.readTree(jsonBody);
        JsonNode data = root.path("data");

        if (!data.isArray()) {
            log.warn("SharpAPI response 'data' is not an array for match {}", match.getId());
            return;
        }

        Double homeOdds = null;
        Double drawOdds = null;
        Double awayOdds = null;
        Double homeAdvanceOdds = null;
        Double awayAdvanceOdds = null;

        java.util.Map<String, Double> exactScoresMap = new java.util.TreeMap<>((s1, s2) -> {
            String[] p1 = s1.split("-");
            String[] p2 = s2.split("-");
            int h1 = Integer.parseInt(p1[0]);
            int a1 = Integer.parseInt(p1[1]);
            int h2 = Integer.parseInt(p2[0]);
            int a2 = Integer.parseInt(p2[1]);

            int cat1 = h1 > a1 ? 1 : (h1 == a1 ? 2 : 3);
            int cat2 = h2 > a2 ? 1 : (h2 == a2 ? 2 : 3);

            if (cat1 != cat2) return Integer.compare(cat1, cat2);

            if (h1 != h2) return Integer.compare(h1, h2);
            return Integer.compare(a1, a2);
        });

        for (JsonNode selection : data) {
            String marketType = selection.path("market_type").asText();
            String selectionType = selection.path("selection_type").asText();
            double oddsDecimal = selection.path("odds_decimal").asDouble(0.0);

            if (oddsDecimal <= 0)
                continue;

            // Moneyline (1X2)
            if ("moneyline".equals(marketType) || "1st_half_moneyline".equals(marketType)) { // Ensure it's full match
                                                                                             // moneyline, but fallback
                                                                                             // to others if needed?
                                                                                             // Sharp API full match is
                                                                                             // usually just "moneyline"
                if ("moneyline".equals(marketType)) {
                    if ("home".equals(selectionType)) {
                        homeOdds = oddsDecimal;
                    } else if ("draw".equals(selectionType)) {
                        drawOdds = oddsDecimal;
                    } else if ("away".equals(selectionType)) {
                        awayOdds = oddsDecimal;
                    }
                }
            }

            // Qualification / Outright (Advance)
            if ("to_qualify".equals(marketType) || "outright".equals(marketType)) {
                if ("home".equals(selectionType)) {
                    homeAdvanceOdds = oddsDecimal;
                } else if ("away".equals(selectionType)) {
                    awayAdvanceOdds = oddsDecimal;
                }
            }

            if ("correct_score".equals(marketType)) {
                // selection string is usually "2-1", "1-0" etc.
                // We need to filter out grouped strings like "Ghana to win 2-1, 3-1 or 4-1"
                String scoreLabel = selection.path("selection").asText();
                if (scoreLabel != null && scoreLabel.matches("^\\d+-\\d+$")) {
                    exactScoresMap.put(scoreLabel, oddsDecimal);
                }
            }
        }

        // Apply findings to match
        if (homeOdds != null)
            match.setHomeOdds(homeOdds);
        if (drawOdds != null)
            match.setDrawOdds(drawOdds);
        if (awayOdds != null)
            match.setAwayOdds(awayOdds);

        if (homeAdvanceOdds != null)
            match.setHomeAdvanceOdds(homeAdvanceOdds);
        if (awayAdvanceOdds != null)
            match.setAwayAdvanceOdds(awayAdvanceOdds);

        if (!exactScoresMap.isEmpty()) {
            match.setExactScoreOddsJson(objectMapper.writeValueAsString(exactScoresMap));
        }

        log.info("Successfully parsed and applied odds for match {}. Home: {}, Draw: {}, Away: {}", match.getId(),
                homeOdds, drawOdds, awayOdds);
    }

    /**
     * Fetches available soccer events from SharpAPI for the FanDuel sportsbook.
     * @return the raw JSON response containing the events
     */
    public String fetchAvailableEvents() {
        if (sharpApiKey == null || sharpApiKey.trim().isEmpty()) {
            throw new RuntimeException("SharpAPI key is not configured.");
        }

        String url = "https://api.sharpapi.io/api/v1/events?sport=soccer&sportsbook=fanduel";

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("X-API-Key", sharpApiKey)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return response.body();
            } else {
                log.error("Failed to fetch events from SharpAPI. Status code: {}, Response: {}", response.statusCode(), response.body());
                throw new RuntimeException("SharpAPI returned status " + response.statusCode());
            }

        } catch (Exception e) {
            log.error("Error occurred while fetching available events", e);
            throw new RuntimeException("Error fetching events: " + e.getMessage(), e);
        }
    }
}
