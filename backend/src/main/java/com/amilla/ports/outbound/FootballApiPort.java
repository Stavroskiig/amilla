package com.amilla.ports.outbound;

import com.amilla.domain.model.Match;

import java.util.List;

public interface FootballApiPort {
    /**
     * Fetches current fixtures and settled matches from external source.
     */
    List<Match> fetchFixturesAndResults();
}
