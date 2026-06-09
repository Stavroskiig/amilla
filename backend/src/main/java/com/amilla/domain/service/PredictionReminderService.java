package com.amilla.domain.service;

import com.amilla.domain.model.Match;
import com.amilla.domain.model.Prediction;
import com.amilla.domain.model.User;
import com.amilla.ports.outbound.MatchRepositoryPort;
import com.amilla.ports.outbound.PredictionRepositoryPort;
import com.amilla.ports.outbound.LongTermPredictionRepositoryPort;
import com.amilla.ports.outbound.UserRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PredictionReminderService {

    private final MatchRepositoryPort matchRepository;
    private final PredictionRepositoryPort predictionRepository;
    private final LongTermPredictionRepositoryPort longTermPredictionRepository;
    private final UserRepositoryPort userRepository;
    private final PushNotificationService pushNotificationService;

    // Run every 30 minutes
    @Scheduled(cron = "0 0/30 * * * *")
    public void sendRemindersForUpcomingMatches() {
        log.info("Running scheduled task: sendRemindersForUpcomingMatches");

        Instant now = Instant.now();

        // Find matches starting in exactly 2 hours (we use a window between now and 2 hours)
        // To avoid spamming, we might want to check matches starting between 90 to 120 mins from now.
        // But for simplicity, let's find matches between 90 and 120 mins from now.
        Instant startWindow = now.plus(90, ChronoUnit.MINUTES);
        Instant endWindow = now.plus(120, ChronoUnit.MINUTES);

        List<Match> upcomingMatches = matchRepository.findUpcomingMatches(startWindow, endWindow);

        if (upcomingMatches.isEmpty()) {
            return;
        }

        List<User> allUsers = userRepository.findAll();

        for (Match match : upcomingMatches) {
            String payload = String.format("{\"title\": \"Υπενθύμιση Πρόβλεψης\", \"body\": \"Μην ξεχάσετε να κάνετε πρόβλεψη για το %s - %s! Ο αγώνας ξεκινάει σε λιγότερο από 2 ώρες.\"}", 
                    match.getHomeTeam(), match.getAwayTeam());

            for (User user : allUsers) {
                Optional<Prediction> prediction = predictionRepository.findByUserIdAndMatchId(user.getId(), match.getId());
                if (prediction.isEmpty()) {
                    // User hasn't predicted, send notification
                    pushNotificationService.sendNotificationToUser(user.getId(), payload);
                }
            }
        }
    }

    // Run every day at 22:30 (Athens time) to remind users about Long Term Predictions
    @Scheduled(cron = "0 30 22 * * *", zone = "Europe/Athens")
    public void sendLongTermPredictionReminders() {
        log.info("Running scheduled task: sendLongTermPredictionReminders");

        // Stop reminding after the group stage ends (adjust this date to the actual end of your group stage)
        Instant groupStageEnd = Instant.parse("2026-06-27T23:59:59Z");
        if (Instant.now().isAfter(groupStageEnd)) {
            log.info("Group stage has ended. Skipping long-term prediction reminders.");
            return;
        }

        List<User> allUsers = userRepository.findAll();
        String payload = "{\"title\": \"Μακροχρόνια Πρόβλεψη\", \"body\": \"Μην ξεχάσετε να υποβάλετε την μακροχρόνια πρόβλεψή σας για τον Πρωταθλητή!\"}";

        for (User user : allUsers) {
            if (longTermPredictionRepository.findByUserId(user.getId()).isEmpty()) {
                pushNotificationService.sendNotificationToUser(user.getId(), payload);
            }
        }
    }
}
