package com.amilla.adapters.outbound.persistence;

import com.amilla.adapters.outbound.persistence.entity.PredictionEntity;
import com.amilla.adapters.outbound.persistence.repository.PredictionJpaRepository;
import com.amilla.domain.model.Prediction;
import com.amilla.ports.outbound.PredictionRepositoryPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@SuppressWarnings("null")
public class PredictionPersistenceAdapter implements PredictionRepositoryPort {

    private final PredictionJpaRepository repository;

    public PredictionPersistenceAdapter(PredictionJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<Prediction> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<Prediction> findByUserIdAndMatchId(UUID userId, String matchId) {
        return repository.findByUserIdAndMatchId(userId, matchId).map(this::toDomain);
    }

    @Override
    public List<Prediction> findByMatchId(String matchId) {
        return repository.findByMatchId(matchId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Prediction> findByUserId(UUID userId) {
        return repository.findByUserId(userId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Prediction save(Prediction prediction) {
        PredictionEntity entity = toEntity(prediction);
        PredictionEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public List<Prediction> saveAll(List<Prediction> predictions) {
        List<PredictionEntity> entities = predictions.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
        List<PredictionEntity> saved = repository.saveAll(entities);
        return saved.stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Prediction> findAll() {
        return repository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteByMatchId(String matchId) {
        repository.deleteByMatchId(matchId);
    }

    @Override
    public void deleteAll() {
        repository.deleteAll();
    }

    private Prediction toDomain(PredictionEntity entity) {
        if (entity == null) return null;
        return Prediction.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .matchId(entity.getMatchId())
                .predictedHomeScore(entity.getPredictedHomeScore())
                .predictedAwayScore(entity.getPredictedAwayScore())
                .predictedQualifier(entity.getPredictedQualifier())
                .predictedQualificationMethod(entity.getPredictedQualificationMethod())
                .pointsEarned(entity.getPointsEarned())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private PredictionEntity toEntity(Prediction domain) {
        if (domain == null) return null;
        return PredictionEntity.builder()
                .id(domain.getId())
                .userId(domain.getUserId())
                .matchId(domain.getMatchId())
                .predictedHomeScore(domain.getPredictedHomeScore())
                .predictedAwayScore(domain.getPredictedAwayScore())
                .predictedQualifier(domain.getPredictedQualifier())
                .predictedQualificationMethod(domain.getPredictedQualificationMethod())
                .pointsEarned(domain.getPointsEarned())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}
