package com.amilla.adapters.outbound.persistence.repository;

import com.amilla.adapters.outbound.persistence.entity.LongTermPredictionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LongTermPredictionJpaRepository extends JpaRepository<LongTermPredictionEntity, UUID> {
    Optional<LongTermPredictionEntity> findByUserId(UUID userId);
}
