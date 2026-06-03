package com.amilla.application.service;

import com.amilla.domain.model.User;
import com.amilla.ports.inbound.ViewLeaderboardUseCase;
import com.amilla.ports.outbound.UserRepositoryPort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeaderboardService implements ViewLeaderboardUseCase {

    private final UserRepositoryPort userRepository;

    public LeaderboardService(UserRepositoryPort userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<User> getLeaderboard() {
        return userRepository.findAllOrderByPointsDesc();
    }
}
