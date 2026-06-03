package com.amilla.adapters.outbound.persistence;

import com.amilla.adapters.outbound.persistence.entity.LongTermPredictionEntity;
import com.amilla.adapters.outbound.persistence.repository.LongTermPredictionJpaRepository;
import com.amilla.domain.model.LongTermPrediction;
import com.amilla.ports.outbound.LongTermPredictionRepositoryPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class LongTermPredictionPersistenceAdapter implements LongTermPredictionRepositoryPort {

    private final LongTermPredictionJpaRepository repository;

    public LongTermPredictionPersistenceAdapter(LongTermPredictionJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<LongTermPrediction> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<LongTermPrediction> findByUserId(UUID userId) {
        return repository.findByUserId(userId).map(this::toDomain);
    }

    @Override
    public LongTermPrediction save(LongTermPrediction prediction) {
        LongTermPredictionEntity entity = toEntity(prediction);
        LongTermPredictionEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public List<LongTermPrediction> findAll() {
        return repository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private LongTermPrediction toDomain(LongTermPredictionEntity entity) {
        if (entity == null) return null;
        return LongTermPrediction.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .predictedChampionTeam(entity.getPredictedChampionTeam())
                .submittedAt(entity.getSubmittedAt())
                .build();
    }

    private LongTermPredictionEntity toEntity(LongTermPrediction domain) {
        if (domain == null) return null;
        return LongTermPredictionEntity.builder()
                .id(domain.getId())
                .userId(domain.getUserId())
                .predictedChampionTeam(domain.getPredictedChampionTeam())
                .submittedAt(domain.getSubmittedAt())
                .build();
    }
}
