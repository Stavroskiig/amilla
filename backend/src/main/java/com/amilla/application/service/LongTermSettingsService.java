package com.amilla.application.service;

import com.amilla.ports.inbound.LongTermSettingsUseCase;
import com.amilla.ports.inbound.ManageMatchUseCase;
import com.amilla.ports.outbound.TournamentSettingsRepositoryPort;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class LongTermSettingsService implements LongTermSettingsUseCase {

    private final TournamentSettingsRepositoryPort settingsRepository;
    private final ManageMatchUseCase manageMatchUseCase;

    public LongTermSettingsService(TournamentSettingsRepositoryPort settingsRepository, ManageMatchUseCase manageMatchUseCase) {
        this.settingsRepository = settingsRepository;
        this.manageMatchUseCase = manageMatchUseCase;
    }

    @Override
    public Map<String, Integer> getAllPlayerGoals() {
        return settingsRepository.getAllPlayerGoals();
    }

    @Override
    public void updatePlayerGoals(String playerName, Integer goals) {
        settingsRepository.savePlayerGoal(playerName, goals);
    }

    @Override
    public void resolveTournament(String championTeam, String topScorer) {
        settingsRepository.saveSetting("RESOLVED_CHAMPION", championTeam);
        settingsRepository.saveSetting("RESOLVED_TOP_SCORER", topScorer);
        
        // Trigger a global recalculation to award long-term points
        manageMatchUseCase.forceRecalculatePoints();
    }

    @Override
    public String getResolvedChampion() {
        return settingsRepository.getSetting("RESOLVED_CHAMPION");
    }

    @Override
    public String getResolvedTopScorer() {
        return settingsRepository.getSetting("RESOLVED_TOP_SCORER");
    }
}
