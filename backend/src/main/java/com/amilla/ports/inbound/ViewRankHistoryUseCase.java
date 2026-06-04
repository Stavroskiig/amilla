package com.amilla.ports.inbound;

import com.amilla.domain.model.UserRankHistory;

import java.util.List;
import java.util.UUID;

public interface ViewRankHistoryUseCase {
    List<UserRankHistory> getRankHistoryForUser(UUID userId);
}
