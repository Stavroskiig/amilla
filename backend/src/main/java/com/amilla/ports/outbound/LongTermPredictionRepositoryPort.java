package com.amilla.ports.outbound;

import com.amilla.domain.model.LongTermPrediction;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LongTermPredictionRepositoryPort {
    Optional<LongTermPrediction> findById(UUID id);
    Optional<LongTermPrediction> findByUserId(UUID userId);
    LongTermPrediction save(LongTermPrediction prediction);
    List<LongTermPrediction> findAll();
}
