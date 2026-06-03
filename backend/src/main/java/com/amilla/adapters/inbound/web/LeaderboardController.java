package com.amilla.adapters.inbound.web;

import com.amilla.domain.model.User;
import com.amilla.ports.inbound.ViewLeaderboardUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final ViewLeaderboardUseCase viewLeaderboardUseCase;

    public LeaderboardController(ViewLeaderboardUseCase viewLeaderboardUseCase) {
        this.viewLeaderboardUseCase = viewLeaderboardUseCase;
    }

    @GetMapping
    public ResponseEntity<List<User>> getLeaderboard() {
        return ResponseEntity.ok(viewLeaderboardUseCase.getLeaderboard());
    }
}
