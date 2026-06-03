package com.amilla.ports.outbound;

public interface NotificationPort {
    /**
     * Sends a message to the target family chat/group.
     */
    void sendNotification(String message);
}
