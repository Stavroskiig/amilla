package com.amilla.adapters.outbound.persistence.repository;

import com.amilla.adapters.outbound.persistence.entity.MatchEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchJpaRepository extends JpaRepository<MatchEntity, String> {
}
