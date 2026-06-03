package com.amilla.adapters.outbound.viber;

import com.amilla.ports.outbound.NotificationPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@Component
public class ViberAdapter implements NotificationPort {

    private static final Logger log = LoggerFactory.getLogger(ViberAdapter.class);

    private final boolean mockMode;
    private final String apiUrl;
    private final String authToken;
    private final String receiverId;
    private final WebClient webClient;

    public ViberAdapter(
            @Value("${amilla.viber.mock:true}") boolean mockMode,
            @Value("${amilla.viber.api-url}") String apiUrl,
            @Value("${amilla.viber.auth-token}") String authToken,
            @Value("${amilla.viber.receiver-id}") String receiverId,
            WebClient.Builder webClientBuilder) {
        this.mockMode = mockMode;
        this.apiUrl = apiUrl;
        this.authToken = authToken;
        this.receiverId = receiverId;
        this.webClient = webClientBuilder.baseUrl(apiUrl).build();
    }

    @Override
    public void sendNotification(String message) {
        if (mockMode) {
            log.info("[MOCK VIBER BOT] Sending message: {}", message);
            return;
        }

        log.info("Sending Viber notification: {}", message);
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("receiver", receiverId);
            body.put("type", "text");
            body.put("text", message);

            Map<String, String> sender = new HashMap<>();
            sender.put("name", "Amilla Bot");
            body.put("sender", sender);

            webClient.post()
                    .uri("/post")
                    .header("X-Viber-Auth-Token", authToken)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .subscribe(
                        response -> log.info("Viber message sent successfully. Response: {}", response),
                        error -> log.error("Failed to send Viber message", error)
                    );
        } catch (Exception e) {
            log.error("Exception occurred while sending Viber message", e);
        }
    }
}
