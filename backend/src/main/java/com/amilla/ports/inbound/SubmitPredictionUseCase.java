package com.amilla.ports.inbound;

import com.amilla.domain.model.LongTermPrediction;
import com.amilla.domain.model.Prediction;

import java.util.List;
import java.util.UUID;

public interface SubmitPredictionUseCase {
    Prediction submitMatchPrediction(UUID userId, String matchId, int homeScore, int awayScore, String qualifier, String predictedQualificationMethod);
    LongTermPrediction submitLongTermPrediction(UUID userId, String championTeam, String predictedTopScorer);
    Prediction getPrediction(UUID userId, String matchId);
    List<Prediction> getPredictionsByUser(UUID userId);
    List<Prediction> getAllPredictionsForMatch(String matchId);
    LongTermPrediction getLongTermPrediction(UUID userId);
    List<LongTermPrediction> getAllLongTermPredictions();
    List<LongTermPrediction> getAdminAllLongTermPredictions();
}
