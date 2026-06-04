package com.amilla.adapters.inbound.web;

import com.amilla.adapters.inbound.web.dto.LongTermRequest;
import com.amilla.adapters.inbound.web.dto.PredictionRequest;
import com.amilla.domain.model.LongTermPrediction;
import com.amilla.domain.model.Prediction;
import com.amilla.domain.model.User;
import com.amilla.ports.inbound.AuthenticationUseCase;
import com.amilla.ports.inbound.SubmitPredictionUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/predictions")
public class PredictionController {

    private final SubmitPredictionUseCase submitPredictionUseCase;
    private final AuthenticationUseCase authenticationUseCase;

    public PredictionController(
            SubmitPredictionUseCase submitPredictionUseCase,
            AuthenticationUseCase authenticationUseCase) {
        this.submitPredictionUseCase = submitPredictionUseCase;
        this.authenticationUseCase = authenticationUseCase;
    }

    @PostMapping("/match")
    public ResponseEntity<Prediction> submitMatchPrediction(@Validated @RequestBody PredictionRequest request) {
        User user = getCurrentUser();
        Prediction prediction = submitPredictionUseCase.submitMatchPrediction(
                user.getId(),
                request.getMatchId(),
                request.getPredictedHomeScore(),
                request.getPredictedAwayScore(),
                request.getPredictedQualifier()
        );
        return ResponseEntity.ok(prediction);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Prediction>> getMyPredictions() {
        User user = getCurrentUser();
        List<Prediction> predictions = submitPredictionUseCase.getPredictionsByUser(user.getId());
        return ResponseEntity.ok(predictions);
    }

    @GetMapping("/match/{matchId}")
    public ResponseEntity<Prediction> getMyPrediction(@PathVariable String matchId) {
        User user = getCurrentUser();
        Prediction prediction = submitPredictionUseCase.getPrediction(user.getId(), matchId);
        return ResponseEntity.ok(prediction);
    }

    @GetMapping("/match/{matchId}/others")
    public ResponseEntity<List<Prediction>> getOthersPredictions(@PathVariable String matchId) {
        // Enforces transparency rules (T-5 min lock visibility check is done in Service)
        List<Prediction> predictions = submitPredictionUseCase.getAllPredictionsForMatch(matchId);
        
        // Exclude the current user's own prediction from this list for layout convenience,
        // or keep all. Let's return all.
        return ResponseEntity.ok(predictions);
    }

    @PostMapping("/longterm")
    public ResponseEntity<LongTermPrediction> submitLongTermPrediction(@Validated @RequestBody LongTermRequest request) {
        User user = getCurrentUser();
        LongTermPrediction prediction = submitPredictionUseCase.submitLongTermPrediction(
                user.getId(),
                request.getChampionTeam()
        );
        return ResponseEntity.ok(prediction);
    }

    @GetMapping("/longterm")
    public ResponseEntity<LongTermPrediction> getMyLongTermPrediction() {
        User user = getCurrentUser();
        LongTermPrediction prediction = submitPredictionUseCase.getLongTermPrediction(user.getId());
        return ResponseEntity.ok(prediction);
    }

    @GetMapping("/longterm/all")
    public ResponseEntity<List<LongTermPrediction>> getAllLongTermPredictions() {
        List<LongTermPrediction> predictions = submitPredictionUseCase.getAllLongTermPredictions();
        return ResponseEntity.ok(predictions);
    }

    private User getCurrentUser() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return authenticationUseCase.getUserByEmail(email);
    }
}
