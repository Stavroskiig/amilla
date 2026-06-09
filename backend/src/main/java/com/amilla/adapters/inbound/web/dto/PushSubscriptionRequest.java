package com.amilla.adapters.inbound.web.dto;

import lombok.Data;

@Data
public class PushSubscriptionRequest {
    private String endpoint;
    private Keys keys;

    @Data
    public static class Keys {
        private String p256dh;
        private String auth;
    }
}
