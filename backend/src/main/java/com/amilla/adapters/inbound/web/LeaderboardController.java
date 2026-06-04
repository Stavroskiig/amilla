package com.amilla.adapters.inbound.web;

import com.amilla.adapters.inbound.web.dto.UserRankHistoryDto;
import com.amilla.domain.model.Match;
import com.amilla.domain.model.User;
import com.amilla.domain.model.UserRankHistory;
import com.amilla.ports.inbound.ManageMatchUseCase;
import com.amilla.ports.inbound.ViewLeaderboardUseCase;
import com.amilla.ports.inbound.ViewRankHistoryUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

    private final ViewLeaderboardUseCase viewLeaderboardUseCase;
    private final ViewRankHistoryUseCase viewRankHistoryUseCase;
    private final ManageMatchUseCase manageMatchUseCase;

    public LeaderboardController(
            ViewLeaderboardUseCase viewLeaderboardUseCase,
            ViewRankHistoryUseCase viewRankHistoryUseCase,
            ManageMatchUseCase manageMatchUseCase) {
        this.viewLeaderboardUseCase = viewLeaderboardUseCase;
        this.viewRankHistoryUseCase = viewRankHistoryUseCase;
        this.manageMatchUseCase = manageMatchUseCase;
    }

    @GetMapping
    public ResponseEntity<List<User>> getLeaderboard() {
        return ResponseEntity.ok(viewLeaderboardUseCase.getLeaderboard());
    }

    @GetMapping("/history/user/{userId}")
    public ResponseEntity<List<UserRankHistoryDto>> getRankHistory(@PathVariable("userId") UUID userId) {
        List<UserRankHistory> history = viewRankHistoryUseCase.getRankHistoryForUser(userId);
        
        List<UserRankHistoryDto> dtos = history.stream().map(h -> {
            Match match = manageMatchUseCase.getMatch(h.getMatchId());
            return UserRankHistoryDto.builder()
                    .matchId(h.getMatchId())
                    .homeTeam(match != null ? match.getHomeTeam() : "Unknown")
                    .awayTeam(match != null ? match.getAwayTeam() : "Unknown")
                    .matchStage(match != null ? match.getMatchStage() : "")
                    .kickoffTime(match != null ? match.getKickoffTime() : h.getCreatedAt())
                    .points(h.getPoints())
                    .rank(h.getRank())
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}
