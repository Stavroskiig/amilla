package com.amilla.adapters.outbound.persistence;

import com.amilla.adapters.outbound.persistence.entity.MatchEntity;
import com.amilla.adapters.outbound.persistence.repository.MatchJpaRepository;
import com.amilla.domain.model.Match;
import com.amilla.ports.outbound.MatchRepositoryPort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class MatchPersistenceAdapter implements MatchRepositoryPort {

    private final MatchJpaRepository repository;

    public MatchPersistenceAdapter(MatchJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<Match> findById(String id) {
        return repository.findById(id).map(this::toDomain);
    }

    @Override
    public List<Match> findAll() {
        return repository.findAll().stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Match save(Match match) {
        MatchEntity entity = toEntity(match);
        MatchEntity saved = repository.save(entity);
        return toDomain(saved);
    }

    @Override
    public List<Match> saveAll(List<Match> matches) {
        List<MatchEntity> entities = matches.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
        List<MatchEntity> saved = repository.saveAll(entities);
        return saved.stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(String id) {
        repository.deleteById(id);
    }

    @Override
    public void deleteAll() {
        repository.deleteAll();
    }

    private Match toDomain(MatchEntity entity) {
        if (entity == null) return null;
        return Match.builder()
                .id(entity.getId())
                .homeTeam(entity.getHomeTeam())
                .awayTeam(entity.getAwayTeam())
                .matchStage(entity.getMatchStage())
                .kickoffTime(entity.getKickoffTime())
                .homeScore90(entity.getHomeScore90())
                .awayScore90(entity.getAwayScore90())
                .qualifiedTeam(entity.getQualifiedTeam())
                .status(entity.getStatus())
                .homeOdds(entity.getHomeOdds())
                .drawOdds(entity.getDrawOdds())
                .awayOdds(entity.getAwayOdds())
                .homeAdvanceOdds(entity.getHomeAdvanceOdds())
                .awayAdvanceOdds(entity.getAwayAdvanceOdds())
                .exactScoreOddsJson(entity.getExactScoreOddsJson())
                .build();
    }

    private MatchEntity toEntity(Match domain) {
        if (domain == null) return null;
        return MatchEntity.builder()
                .id(domain.getId())
                .homeTeam(domain.getHomeTeam())
                .awayTeam(domain.getAwayTeam())
                .matchStage(domain.getMatchStage())
                .kickoffTime(domain.getKickoffTime())
                .homeScore90(domain.getHomeScore90())
                .awayScore90(domain.getAwayScore90())
                .qualifiedTeam(domain.getQualifiedTeam())
                .status(domain.getStatus())
                .homeOdds(domain.getHomeOdds())
                .drawOdds(domain.getDrawOdds())
                .awayOdds(domain.getAwayOdds())
                .homeAdvanceOdds(domain.getHomeAdvanceOdds())
                .awayAdvanceOdds(domain.getAwayAdvanceOdds())
                .exactScoreOddsJson(domain.getExactScoreOddsJson())
                .build();
    }
}
