package com.amilla.adapters.inbound.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRankHistoryDto {
    private String matchId;
    private String homeTeam;
    private String awayTeam;
    private String matchStage;
    private Instant kickoffTime;
    private int points;
    private int rank;
}
