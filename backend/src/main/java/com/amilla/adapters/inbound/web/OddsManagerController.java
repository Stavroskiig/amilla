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

    public OddsManagerController(ManageMatchUseCase manageMatchUseCase) {
        this.manageMatchUseCase = manageMatchUseCase;
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
                request.getExactScoreOddsJson()
        );
        return ResponseEntity.ok(match);
    }
}