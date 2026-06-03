package com.amilla.adapters.inbound.web.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class MatchCreateRequest {
    private String id;
    private String homeTeam;
    private String awayTeam;
    private String matchStage;
    private Instant kickoffTime;
}
