package com.amilla.adapters.inbound.web;

import com.amilla.adapters.inbound.web.dto.MatchSummaryDto;
import com.amilla.domain.model.Match;
import com.amilla.ports.inbound.ManageMatchUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final ManageMatchUseCase manageMatchUseCase;

    public MatchController(ManageMatchUseCase manageMatchUseCase) {
        this.manageMatchUseCase = manageMatchUseCase;
    }

    @GetMapping
    public ResponseEntity<List<MatchSummaryDto>> getAllMatches() {
        List<MatchSummaryDto> dtos = manageMatchUseCase.getAllMatches().stream()
                .map(MatchSummaryDto::fromDomain)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Match> getMatchById(@PathVariable String id) {
        Match match = manageMatchUseCase.getMatch(id);
        if (match == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(match);
    }
}
