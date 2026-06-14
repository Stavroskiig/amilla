package com.amilla.ports.outbound;

import java.util.Map;

public interface TournamentSettingsRepositoryPort {
    // Player Goals
    Map<String, Integer> getAllPlayerGoals();
    void savePlayerGoal(String playerName, Integer goals);
    
    // Tournament Settings
    @org.springframework.lang.Nullable
    String getSetting(@org.springframework.lang.NonNull String key);
    void saveSetting(String key, String value);
}
