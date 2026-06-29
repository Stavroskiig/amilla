package com.amilla.adapters.inbound.web;

import com.amilla.adapters.inbound.web.dto.OddsUpdateRequest;
import com.amilla.domain.model.Match;
import com.amilla.ports.inbound.ManageMatchUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/odds-manager")
public class OddsManagerController {

    private final ManageMatchUseCase manageMatchUseCase;
    private final com.amilla.adapters.outbound.sharpapi.SharpApiClient sharpApiClient;

    public OddsManagerController(ManageMatchUseCase manageMatchUseCase, com.amilla.adapters.outbound.sharpapi.SharpApiClient sharpApiClient) {
        this.manageMatchUseCase = manageMatchUseCase;
        this.sharpApiClient = sharpApiClient;
    }

    @PutMapping("/matches/{id}/odds")
    public ResponseEntity<Match> updateMatchOdds(
            @PathVariable String id,
            @RequestBody OddsUpdateRequest request) {
        Match match = manageMatchUseCase.updateMatchOdds(
                id,
                request.getHomeOdds(),
                request.getDrawOdds(),
                request.getAwayOdds(),
                request.getHomeAdvanceOdds(),
                request.getAwayAdvanceOdds(),
                request.getExactScoreOddsJson(),
                request.getQualifierOddsJson()
        );
        return ResponseEntity.ok(match);
    }

    @PostMapping("/matches/{id}/sync-odds")
    public ResponseEntity<Match> manuallySyncOdds(@PathVariable String id) {
        Match match = manageMatchUseCase.getMatch(id);
        if (match == null) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            sharpApiClient.fetchAndUpdateOdds(match);
            match.setAutoOddsFetched(true);
            
            Match savedMatch = manageMatchUseCase.updateMatchOdds(
                    match.getId(),
                    match.getHomeOdds(),
                    match.getDrawOdds(),
                    match.getAwayOdds(),
                    match.getHomeAdvanceOdds(),
                    match.getAwayAdvanceOdds(),
                    match.getExactScoreOddsJson(),
                    match.getQualifierOddsJson()
            );
            return ResponseEntity.ok(savedMatch);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/sharpapi/events")
    public ResponseEntity<String> getSharpApiEvents() {
        try {
            String eventsJson = sharpApiClient.fetchAvailableEvents();
            return ResponseEntity.ok()
                    .header("Content-Type", "application/json")
                    .body(eventsJson);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    @PutMapping("/matches/{id}/external-id")
    public ResponseEntity<Match> updateExternalApiId(@PathVariable String id, @RequestBody java.util.Map<String, String> request) {
        String externalApiId = request.get("externalApiId");
        Match updatedMatch = manageMatchUseCase.updateMatchExternalApiId(id, externalApiId);
        return ResponseEntity.ok(updatedMatch);
    }
}