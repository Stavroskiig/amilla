package com.amilla.adapters.outbound.persistence;

import com.amilla.adapters.outbound.persistence.entity.UserRankHistoryEntity;
import com.amilla.adapters.outbound.persistence.repository.UserRankHistoryJpaRepository;
import com.amilla.domain.model.UserRankHistory;
import com.amilla.ports.outbound.UserRankHistoryRepositoryPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@Component
@SuppressWarnings("null")
public class UserRankHistoryPersistenceAdapter implements UserRankHistoryRepositoryPort {

    private final UserRankHistoryJpaRepository repository;

    public UserRankHistoryPersistenceAdapter(UserRankHistoryJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<UserRankHistory> findByUserId(UUID userId) {
        return repository.findByUserIdOrderByMatchKickoffTimeAsc(userId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserRankHistory> findAll() {
        return repository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public UserRankHistory save(UserRankHistory history) {
        UserRankHistoryEntity entity = toEntity(history);
        UserRankHistoryEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public List<UserRankHistory> saveAll(List<UserRankHistory> histories) {
        List<UserRankHistoryEntity> entities = histories.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
        List<UserRankHistoryEntity> saved = repository.saveAll(entities);
        return saved.stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteAll() {
        repository.deleteAll();
    }

    @Override
    public void deleteByUserId(UUID userId) {
        repository.deleteByUserId(userId);
    }

    private UserRankHistory toDomain(UserRankHistoryEntity entity) {
        if (entity == null) return null;
        return UserRankHistory.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .matchId(entity.getMatchId())
                .points(entity.getPoints())
                .rank(entity.getRank())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private UserRankHistoryEntity toEntity(UserRankHistory domain) {
        if (domain == null) return null;
        return UserRankHistoryEntity.builder()
                .id(domain.getId())
                .userId(domain.getUserId())
                .matchId(domain.getMatchId())
                .points(domain.getPoints())
                .rank(domain.getRank())
                .createdAt(domain.getCreatedAt())
                .build();
    }
}
