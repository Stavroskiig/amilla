package com.amilla.adapters.outbound.persistence;

import com.amilla.adapters.outbound.persistence.entity.PlayerGoalEntity;
import com.amilla.adapters.outbound.persistence.entity.TournamentSettingsEntity;
import com.amilla.adapters.outbound.persistence.repository.PlayerGoalRepository;
import com.amilla.adapters.outbound.persistence.repository.TournamentSettingsRepository;
import com.amilla.ports.outbound.TournamentSettingsRepositoryPort;
import org.springframework.stereotype.Component;
import org.springframework.lang.Nullable;

import java.util.Map;
import java.util.stream.Collectors;

@Component
public class TournamentSettingsPersistenceAdapter implements TournamentSettingsRepositoryPort {

    private final PlayerGoalRepository playerGoalRepository;
    private final TournamentSettingsRepository tournamentSettingsRepository;

    public TournamentSettingsPersistenceAdapter(PlayerGoalRepository playerGoalRepository, TournamentSettingsRepository tournamentSettingsRepository) {
        this.playerGoalRepository = playerGoalRepository;
        this.tournamentSettingsRepository = tournamentSettingsRepository;
    }

    @Override
    public Map<String, Integer> getAllPlayerGoals() {
        return playerGoalRepository.findAll().stream()
                .collect(Collectors.toMap(PlayerGoalEntity::getPlayerName, PlayerGoalEntity::getGoals));
    }

    @Override
    public void savePlayerGoal(String playerName, Integer goals) {
        playerGoalRepository.save(new PlayerGoalEntity(playerName, goals));
    }

    @Override
    @Nullable
    public String getSetting(@org.springframework.lang.NonNull String key) {
        return tournamentSettingsRepository.findById(key)
                .map(TournamentSettingsEntity::getSettingValue)
                .orElse(null);
    }

    @Override
    public void saveSetting(String key, String value) {
        tournamentSettingsRepository.save(new TournamentSettingsEntity(key, value));
    }
}
