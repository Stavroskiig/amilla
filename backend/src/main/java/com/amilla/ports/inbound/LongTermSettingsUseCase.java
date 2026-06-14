package com.amilla.ports.inbound;

import java.util.Map;

public interface LongTermSettingsUseCase {
    Map<String, Integer> getAllPlayerGoals();
    void updatePlayerGoals(String playerName, Integer goals);
    
    void resolveTournament(String championTeam, String topScorer);
    
    String getResolvedChampion();
    String getResolvedTopScorer();
}
