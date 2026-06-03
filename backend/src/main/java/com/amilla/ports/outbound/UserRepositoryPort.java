package com.amilla.ports.outbound;

import com.amilla.domain.model.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepositoryPort {
    Optional<User> findById(UUID id);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    User save(User user);
    List<User> findAllOrderByPointsDesc();
    List<User> findAll();
}
