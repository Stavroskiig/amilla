package com.amilla.adapters.inbound.web.dto;

import com.amilla.domain.model.User;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class UserMeResponse {
    private UUID id;
    private String username;
    private String email;
    private String role;
    private int totalPoints;
    private String avatar;
    // Only fields needed for the logged-in user context in the frontend

    public static UserMeResponse fromUser(User user) {
        return UserMeResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .totalPoints(user.getTotalPoints())
                .avatar(user.getAvatar())
                .build();
    }
}
