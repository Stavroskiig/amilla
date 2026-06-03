package com.amilla.domain.exception;

/**
 * Domain Exception thrown when predictions are locked (T-5 min rule).
 */
public class PredictionsLockedException extends RuntimeException {
    public PredictionsLockedException(String message) {
        super(message);
    }
}
