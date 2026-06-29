package com.amilla.ports.inbound;

import com.amilla.domain.model.Match;
import com.amilla.domain.model.Prediction;

import java.util.List;
import java.util.UUID;

public interface ManageMatchUseCase {
    List<Match> getAllMatches();
    Match getMatch(String id);
    Match manuallyUpdateMatchScore(String id, Integer homeScore, Integer awayScore, String qualifiedTeam, String qualificationMethod, String status);
    Match updateMatchTvChannel(String id, String tvChannel);
    Match updateMatchExternalApiId(String id, String externalApiId);
    Match updateMatchOdds(String id, Double homeOdds, Double drawOdds, Double awayOdds, Double homeAdvanceOdds, Double awayAdvanceOdds, String exactScoreOddsJson, String qualifierOddsJson);
    void forceRecalculatePoints();
    Prediction adminOverridePrediction(UUID userId, String matchId, int homeScore, int awayScore, String qualifier, String predictedQualificationMethod);
    Match createMatch(Match match);
    List<Match> bulkCreateMatches(List<Match> matches);
    void deleteMatch(String id);
    void deleteAllMatches();
    void seedMatchesFromJson();
}
