package com.amilla.ports.outbound;

import com.amilla.domain.model.Match;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface MatchRepositoryPort {
    Optional<Match> findById(String id);
    List<Match> findAll();
    Match save(Match match);
    List<Match> saveAll(List<Match> matches);
    void deleteById(String id);
    void deleteAll();
    List<Match> findUpcomingMatches(Instant start, Instant end);
}
