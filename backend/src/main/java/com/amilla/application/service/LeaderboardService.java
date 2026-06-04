package com.amilla.application.service;

import com.amilla.domain.model.User;
import com.amilla.domain.model.UserRankHistory;
import com.amilla.ports.inbound.ViewLeaderboardUseCase;
import com.amilla.ports.inbound.ViewRankHistoryUseCase;
import com.amilla.ports.outbound.UserRepositoryPort;
import com.amilla.ports.outbound.UserRankHistoryRepositoryPort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class LeaderboardService implements ViewLeaderboardUseCase, ViewRankHistoryUseCase {

    private final UserRepositoryPort userRepository;
    private final UserRankHistoryRepositoryPort userRankHistoryRepository;

    public LeaderboardService(UserRepositoryPort userRepository, UserRankHistoryRepositoryPort userRankHistoryRepository) {
        this.userRepository = userRepository;
        this.userRankHistoryRepository = userRankHistoryRepository;
    }

    @Override
    public List<User> getLeaderboard() {
        return userRepository.findAllOrderByPointsDesc();
    }

    @Override
    public List<UserRankHistory> getRankHistoryForUser(UUID userId) {
        return userRankHistoryRepository.findByUserId(userId);
    }
}
