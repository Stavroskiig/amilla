package com.amilla.adapters.outbound.persistence;

import com.amilla.adapters.outbound.persistence.entity.UserEntity;
import com.amilla.adapters.outbound.persistence.repository.UserJpaRepository;
import com.amilla.domain.model.User;
import com.amilla.ports.outbound.UserRepositoryPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class UserPersistenceAdapter implements UserRepositoryPort {

    private final UserJpaRepository repository;

    public UserPersistenceAdapter(UserJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<User> findById(UUID id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return repository.findByUsername(username).map(this::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return repository.findByEmail(email).map(this::toDomain);
    }

    @Override
    public User save(User user) {
        UserEntity entity = toEntity(user);
        UserEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public List<User> findAllOrderByPointsDesc() {
        return repository.findAllByOrderByTotalPointsDesc().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<User> findAll() {
        return repository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    private User toDomain(UserEntity entity) {
        if (entity == null) return null;
        return User.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .email(entity.getEmail())
                .passwordHash(entity.getPasswordHash())
                .role(entity.getRole())
                .totalPoints(entity.getTotalPoints())
                .avatar(entity.getAvatar())
                .previousRank(entity.getPreviousRank())
                .currentStreak(entity.getCurrentStreak())
                .build();
    }

    private UserEntity toEntity(User domain) {
        if (domain == null) return null;
        return UserEntity.builder()
                .id(domain.getId())
                .username(domain.getUsername())
                .email(domain.getEmail())
                .passwordHash(domain.getPasswordHash())
                .role(domain.getRole())
                .totalPoints(domain.getTotalPoints())
                .avatar(domain.getAvatar())
                .previousRank(domain.getPreviousRank())
                .currentStreak(domain.getCurrentStreak())
                .build();
    }
}
