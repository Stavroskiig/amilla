package com.amilla.ports.outbound;

import com.amilla.domain.model.PushSubscription;

import java.util.List;
import java.util.UUID;

public interface PushSubscriptionRepositoryPort {
    PushSubscription save(PushSubscription subscription);
    List<PushSubscription> findByUserId(UUID userId);
    void deleteByEndpoint(String endpoint);
    List<PushSubscription> findAll();
}
