package com.amilla.domain.service;

import com.amilla.domain.model.PushSubscription;
import com.amilla.ports.outbound.PushSubscriptionRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.jose4j.lang.JoseException;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
@Slf4j
public class PushNotificationService {

    private final PushService pushService;
    private final PushSubscriptionRepositoryPort subscriptionRepository;

    public void sendNotificationToUser(UUID userId, String payload) {
        List<PushSubscription> subscriptions = subscriptionRepository.findByUserId(userId);
        for (PushSubscription sub : subscriptions) {
            sendNotification(sub, payload);
        }
    }

    private void sendNotification(PushSubscription sub, String payload) {
        try {
            Subscription.Keys keys = new Subscription.Keys(sub.getP256dh(), sub.getAuth());
            Subscription subscription = new Subscription(sub.getEndpoint(), keys);
            Notification notification = new Notification(subscription, payload);
            pushService.send(notification);
        } catch (GeneralSecurityException | IOException | JoseException | ExecutionException | InterruptedException e) {
            log.error("Failed to send push notification to endpoint {}", sub.getEndpoint(), e);
            // In a real app, if it's a 410 Gone, we should delete the subscription
            if (e.getMessage() != null && e.getMessage().contains("410")) {
                subscriptionRepository.deleteByEndpoint(sub.getEndpoint());
            }
        }
    }
}
