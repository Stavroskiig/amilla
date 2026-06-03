package com.amilla.ports.inbound;

import com.amilla.domain.model.User;

import java.util.List;

public interface ViewLeaderboardUseCase {
    List<User> getLeaderboard();
}
