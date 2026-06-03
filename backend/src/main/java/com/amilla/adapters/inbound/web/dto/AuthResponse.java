package com.amilla.adapters.inbound.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private UUID id;
    private String username;
    private String email;
    private String role;
    private int totalPoints;
}
