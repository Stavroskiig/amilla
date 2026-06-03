package com.amilla.adapters.inbound.web;

import com.amilla.adapters.inbound.web.dto.MatchCreateRequest;
import com.amilla.adapters.inbound.web.dto.PredictionOverrideRequest;
import com.amilla.adapters.inbound.web.dto.ScoreUpdateRequest;
import com.amilla.domain.model.Match;
import com.amilla.domain.model.Prediction;
import com.amilla.domain.model.User;
import com.amilla.ports.inbound.ManageMatchUseCase;
import com.amilla.ports.outbound.UserRepositoryPort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ManageMatchUseCase manageMatchUseCase;
    private final UserRepositoryPort userRepository;

    public AdminController(ManageMatchUseCase manageMatchUseCase, UserRepositoryPort userRepository) {
        this.manageMatchUseCase = manageMatchUseCase;
        this.userRepository = userRepository;
    }

    @PostMapping("/matches/sync")
    public ResponseEntity<Void> syncMatches() {
        manageMatchUseCase.syncMatchesWithExternalApi();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/points/recalculate")
    public ResponseEntity<Void> recalculatePoints() {
        manageMatchUseCase.forceRecalculatePoints();
        return ResponseEntity.ok().build();
    }

    @PutMapping("/matches/{id}/score")
    public ResponseEntity<Match> updateMatchScore(
            @PathVariable String id,
            @RequestBody ScoreUpdateRequest request) {
        Match match = manageMatchUseCase.manuallyUpdateMatchScore(
                id,
                request.getHomeScore(),
                request.getAwayScore(),
                request.getQualifiedTeam(),
                request.getStatus()
        );
        return ResponseEntity.ok(match);
    }

    @PutMapping("/predictions/override")
    public ResponseEntity<Prediction> overridePrediction(@RequestBody PredictionOverrideRequest request) {
        Prediction prediction = manageMatchUseCase.adminOverridePrediction(
                request.getUserId(),
                request.getMatchId(),
                request.getHomeScore(),
                request.getAwayScore(),
                request.getQualifier()
        );
        return ResponseEntity.ok(prediction);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/matches")
    public ResponseEntity<Match> createMatch(@RequestBody MatchCreateRequest request) {
        Match match = Match.builder()
                .id(request.getId())
                .homeTeam(request.getHomeTeam())
                .awayTeam(request.getAwayTeam())
                .matchStage(request.getMatchStage())
                .kickoffTime(request.getKickoffTime())
                .build();
        return ResponseEntity.ok(manageMatchUseCase.createMatch(match));
    }

    @PostMapping("/matches/bulk")
    public ResponseEntity<List<Match>> bulkCreateMatches(@RequestBody List<MatchCreateRequest> requests) {
        List<Match> matches = requests.stream()
                .map(r -> Match.builder()
                        .id(r.getId())
                        .homeTeam(r.getHomeTeam())
                        .awayTeam(r.getAwayTeam())
                        .matchStage(r.getMatchStage())
                        .kickoffTime(r.getKickoffTime())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(manageMatchUseCase.bulkCreateMatches(matches));
    }

    @DeleteMapping("/matches/{id}")
    public ResponseEntity<Void> deleteMatch(@PathVariable String id) {
        manageMatchUseCase.deleteMatch(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/matches")
    public ResponseEntity<Void> deleteAllMatches() {
        manageMatchUseCase.deleteAllMatches();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/matches/seed")
    public ResponseEntity<Void> seedMatches() {
        manageMatchUseCase.seedMatchesFromJson();
        return ResponseEntity.ok().build();
    }
}
