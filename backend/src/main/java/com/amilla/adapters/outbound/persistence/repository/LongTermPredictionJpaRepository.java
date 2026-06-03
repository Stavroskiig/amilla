package com.amilla.adapters.outbound.persistence.repository;

import com.amilla.adapters.outbound.persistence.entity.LongTermPredictionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LongTermPredictionJpaRepository extends JpaRepository<LongTermPredictionEntity, UUID> {
    Optional<LongTermPredictionEntity> findFirstByUserIdOrderBySubmittedAtDesc(UUID userId);

    @Query("SELECT p FROM LongTermPredictionEntity p WHERE p.submittedAt = " +
           "(SELECT MAX(p2.submittedAt) FROM LongTermPredictionEntity p2 WHERE p2.userId = p.userId)")
    List<LongTermPredictionEntity> findAllLatest();
}
