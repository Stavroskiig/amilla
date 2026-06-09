package com.amilla.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PushSubscription {
    private UUID id;
    private UUID userId;
    private String endpoint;
    private String p256dh;
    private String auth;
}
