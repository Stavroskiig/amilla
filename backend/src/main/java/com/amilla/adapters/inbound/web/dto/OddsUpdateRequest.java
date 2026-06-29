package com.amilla.adapters.inbound.web.dto;

import lombok.Data;

@Data
public class OddsUpdateRequest {
    private Double homeOdds;
    private Double drawOdds;
    private Double awayOdds;
    private Double homeAdvanceOdds;
    private Double awayAdvanceOdds;
    private String exactScoreOddsJson;
    private String qualifierOddsJson;
}