package com.amilla.ports.outbound;

import com.amilla.domain.model.UserRankHistory;

import java.util.List;
import java.util.UUID;

public interface UserRankHistoryRepositoryPort {
    List<UserRankHistory> findByUserId(UUID userId);
    UserRankHistory save(UserRankHistory history);
    List<UserRankHistory> saveAll(List<UserRankHistory> histories);
    void deleteAll();
    void deleteByUserId(UUID userId);
    List<UserRankHistory> findAll();
}
