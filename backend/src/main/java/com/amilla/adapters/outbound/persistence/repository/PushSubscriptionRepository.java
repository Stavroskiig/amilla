package com.amilla.adapters.outbound.persistence.repository;

import com.amilla.adapters.outbound.persistence.entity.PushSubscriptionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscriptionEntity, UUID> {
    List<PushSubscriptionEntity> findByUserId(UUID userId);
    void deleteByEndpoint(String endpoint);
}
