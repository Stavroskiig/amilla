package com.amilla.ports.outbound;

import com.amilla.domain.model.Prediction;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PredictionRepositoryPort {
    Optional<Prediction> findById(UUID id);
    Optional<Prediction> findByUserIdAndMatchId(UUID userId, String matchId);
    List<Prediction> findByMatchId(String matchId);
    List<Prediction> findByUserId(UUID userId);
    Prediction save(Prediction prediction);
    List<Prediction> saveAll(List<Prediction> predictions);
    List<Prediction> findAll();
    void deleteByMatchId(String matchId);
    void deleteAll();
}
