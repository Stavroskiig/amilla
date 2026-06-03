package com.amilla.adapters.outbound.persistence.repository;

import com.amilla.adapters.outbound.persistence.entity.PredictionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PredictionJpaRepository extends JpaRepository<PredictionEntity, UUID> {
    Optional<PredictionEntity> findByUserIdAndMatchId(UUID userId, String matchId);
    List<PredictionEntity> findByMatchId(String matchId);
    List<PredictionEntity> findByUserId(UUID userId);
    void deleteByMatchId(String matchId);
}
