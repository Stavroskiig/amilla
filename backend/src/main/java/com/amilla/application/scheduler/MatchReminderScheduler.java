package com.amilla.application.scheduler;

import com.amilla.domain.model.Match;
import com.amilla.ports.inbound.ManageMatchUseCase;
import com.amilla.ports.outbound.NotificationPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@EnableScheduling
public class MatchReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(MatchReminderScheduler.class);

    private final ManageMatchUseCase matchUseCase;
    private final NotificationPort notificationPort;
    private final Set<String> sentReminders = new HashSet<>();

    public MatchReminderScheduler(ManageMatchUseCase matchUseCase, NotificationPort notificationPort) {
        this.matchUseCase = matchUseCase;
        this.notificationPort = notificationPort;
    }

    /**
     * Run every 5 minutes to check for matches starting in ~1 hour.
     */
    @Scheduled(cron = "0 */5 * * * *")
    public void sendUpcomingMatchReminders() {
        log.debug("Checking for upcoming matches starting in 1 hour...");
        Instant now = Instant.now();
        List<Match> matches = matchUseCase.getAllMatches();

        for (Match match : matches) {
            if ("FINISHED".equalsIgnoreCase(match.getStatus())) {
                continue;
            }

            Duration duration = Duration.between(now, match.getKickoffTime());
            long minutesLeft = duration.toMinutes();

            // Match is starting in 50 to 65 minutes, and we haven't sent a reminder yet
            if (minutesLeft >= 50 && minutesLeft <= 65 && !sentReminders.contains(match.getId())) {
                String msg = String.format("⏰ Έμεινε 1 ώρα για το ματς %s - %s! Μην ξεχάσετε να υποβάλετε τις προβλέψεις σας!",
                        match.getHomeTeam(), match.getAwayTeam());
                log.info("Sending kickoff reminder for match: {} - {}", match.getHomeTeam(), match.getAwayTeam());
                notificationPort.sendNotification(msg);
                sentReminders.add(match.getId());
            }
        }
    }
}
