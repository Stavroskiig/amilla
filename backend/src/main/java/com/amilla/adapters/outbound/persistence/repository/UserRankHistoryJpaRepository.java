package com.amilla.adapters.outbound.persistence.repository;

import com.amilla.adapters.outbound.persistence.entity.UserRankHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserRankHistoryJpaRepository extends JpaRepository<UserRankHistoryEntity, UUID> {
    
    @Query("SELECT h FROM UserRankHistoryEntity h JOIN MatchEntity m ON h.matchId = m.id WHERE h.userId = :userId ORDER BY m.kickoffTime ASC")
    List<UserRankHistoryEntity> findByUserIdOrderByMatchKickoffTimeAsc(@Param("userId") UUID userId);

    void deleteByUserId(UUID userId);
}
