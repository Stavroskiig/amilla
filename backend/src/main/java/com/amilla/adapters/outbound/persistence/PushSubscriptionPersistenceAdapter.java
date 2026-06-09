package com.amilla.adapters.outbound.persistence;

import com.amilla.adapters.outbound.persistence.entity.PushSubscriptionEntity;
import com.amilla.adapters.outbound.persistence.repository.PushSubscriptionRepository;
import com.amilla.domain.model.PushSubscription;
import com.amilla.ports.outbound.PushSubscriptionRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@SuppressWarnings("null")
public class PushSubscriptionPersistenceAdapter implements PushSubscriptionRepositoryPort {

    private final PushSubscriptionRepository repository;

    @Override
    public PushSubscription save(PushSubscription subscription) {
        PushSubscriptionEntity entity = toEntity(subscription);
        PushSubscriptionEntity savedEntity = repository.save(entity);
        return toDomain(savedEntity);
    }

    @Override
    public List<PushSubscription> findByUserId(UUID userId) {
        return repository.findByUserId(userId).stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteByEndpoint(String endpoint) {
        repository.deleteByEndpoint(endpoint);
    }

    @Override
    public List<PushSubscription> findAll() {
        return repository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private PushSubscriptionEntity toEntity(PushSubscription domain) {
        return PushSubscriptionEntity.builder()
                .id(domain.getId())
                .userId(domain.getUserId())
                .endpoint(domain.getEndpoint())
                .p256dh(domain.getP256dh())
                .auth(domain.getAuth())
                .build();
    }

    private PushSubscription toDomain(PushSubscriptionEntity entity) {
        return PushSubscription.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .endpoint(entity.getEndpoint())
                .p256dh(entity.getP256dh())
                .auth(entity.getAuth())
                .build();
    }
}
