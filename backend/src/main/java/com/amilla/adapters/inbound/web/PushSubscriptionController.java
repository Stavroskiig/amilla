package com.amilla.adapters.inbound.web;

import com.amilla.adapters.inbound.web.dto.PushSubscriptionRequest;
import com.amilla.adapters.security.JwtTokenProvider;
import com.amilla.domain.model.PushSubscription;
import com.amilla.domain.model.User;
import com.amilla.ports.outbound.PushSubscriptionRepositoryPort;
import com.amilla.ports.outbound.UserRepositoryPort;
import com.amilla.domain.service.PushNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/push")
@RequiredArgsConstructor
public class PushSubscriptionController {

    private final PushSubscriptionRepositoryPort subscriptionRepository;
    private final UserRepositoryPort userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PushNotificationService pushNotificationService;

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@RequestHeader("Authorization") String token, 
                                       @RequestBody PushSubscriptionRequest request) {
        String jwt = token.substring(7);
        String email = jwtTokenProvider.getEmailFromToken(jwt);
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }

        User user = userOpt.get();

        PushSubscription subscription = PushSubscription.builder()
                .userId(user.getId())
                .endpoint(request.getEndpoint())
                .p256dh(request.getKeys().getP256dh())
                .auth(request.getKeys().getAuth())
                .build();

        subscriptionRepository.save(subscription);

        return ResponseEntity.ok("Subscribed successfully");
    }

    @DeleteMapping("/unsubscribe")
    public ResponseEntity<?> unsubscribe(@RequestBody PushSubscriptionRequest request) {
        subscriptionRepository.deleteByEndpoint(request.getEndpoint());
        return ResponseEntity.ok("Unsubscribed successfully");
    }
}
