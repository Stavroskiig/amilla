package com.amilla.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Pure Java Domain Model representing a User.
 * Free of JPA or Spring framework annotations to adhere to Hexagonal Architecture.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private UUID id;
    private String username;
    private String email;
    private String passwordHash;
    private String role; // e.g., "ROLE_USER", "ROLE_ADMIN"
    private int totalPoints;
}
