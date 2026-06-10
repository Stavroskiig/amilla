package com.amilla.adapters.inbound.web.dto;

import lombok.Data;

@Data
public class ScoreUpdateRequest {
    private Integer homeScore;
    private Integer awayScore;
    private String qualifiedTeam;
    private String status; // e.g. "SCHEDULED", "LIVE", "FINISHED"
    private String tvChannel;
}
