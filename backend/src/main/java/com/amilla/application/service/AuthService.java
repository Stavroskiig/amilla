package com.amilla.application.service;

import com.amilla.adapters.security.JwtTokenProvider;
import com.amilla.domain.model.User;
import com.amilla.ports.inbound.AuthenticationUseCase;
import com.amilla.ports.outbound.UserRepositoryPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService implements AuthenticationUseCase {

    @Value("${amilla.registration.group-code}")
    private String configuredGroupCode;

    private final UserRepositoryPort userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepositoryPort userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Override
    public User register(String username, String email, String password, String groupCode) {
        if (configuredGroupCode == null || groupCode == null
                || !groupCode.trim().equalsIgnoreCase(configuredGroupCode.trim())) {
            throw new IllegalArgumentException("Λάθος κωδικός ομάδας!");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Το email είναι ήδη σε χρήση!");
        }
        if (userRepository.findByUsername(username).isPresent()) {
            throw new IllegalArgumentException("Το όνομα χρήστη είναι ήδη σε χρήση!");
        }

        // The first registered user can be ADMIN for easier setup/testing,
        // all subsequent users are USER role.
        long userCount = userRepository.findAll().size();
        String role = userCount == 0 ? "ROLE_ADMIN" : "ROLE_USER";

        User user = User.builder()
                .id(UUID.randomUUID())
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(role)
                .totalPoints(0)
                .build();

        return userRepository.save(user);
    }

    @Override
    public String login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password!"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password!");
        }

        return tokenProvider.generateToken(user.getEmail(), user.getRole());
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found!"));
    }

    @Override
    public User updateAvatar(String email, String avatar) {
        User user = getUserByEmail(email);
        user.setAvatar(avatar);
        return userRepository.save(user);
    }
}
