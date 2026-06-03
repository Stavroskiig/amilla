package com.amilla.domain.exception;

/**
 * Domain Exception thrown when a user attempts to edit a long-term prediction after the allowed cutoff.
 */
public class TournamentStartedException extends RuntimeException {
    public TournamentStartedException(String message) {
        super(message);
    }
}
