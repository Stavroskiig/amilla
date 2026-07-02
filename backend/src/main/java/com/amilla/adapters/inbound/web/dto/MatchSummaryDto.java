package com.amilla.adapters.inbound.web.dto;

import com.amilla.domain.model.Match;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchSummaryDto {
    private String id;
    private String homeTeam;
    private String awayTeam;
    private String tvChannel;
    private String matchStage;
    private Instant kickoffTime;
    private Integer homeScore90;
    private Integer awayScore90;
    private String qualifiedTeam;
    private String status;
    private Double homeOdds;
    private Double drawOdds;
    private Double awayOdds;
    private Double homeAdvanceOdds;
    private Double awayAdvanceOdds;
    private String qualificationMethod;
    private Instant oddsLastUpdatedAt;
    private String externalApiId;
    private Boolean autoOddsFetched;

    public static MatchSummaryDto fromDomain(Match match) {
        return MatchSummaryDto.builder()
                .id(match.getId())
                .homeTeam(match.getHomeTeam())
                .awayTeam(match.getAwayTeam())
                .tvChannel(match.getTvChannel())
                .matchStage(match.getMatchStage())
                .kickoffTime(match.getKickoffTime())
                .homeScore90(match.getHomeScore90())
                .awayScore90(match.getAwayScore90())
                .qualifiedTeam(match.getQualifiedTeam())
                .status(match.getStatus())
                .homeOdds(match.getHomeOdds())
                .drawOdds(match.getDrawOdds())
                .awayOdds(match.getAwayOdds())
                .homeAdvanceOdds(match.getHomeAdvanceOdds())
                .awayAdvanceOdds(match.getAwayAdvanceOdds())
                .qualificationMethod(match.getQualificationMethod())
                .oddsLastUpdatedAt(match.getOddsLastUpdatedAt())
                .externalApiId(match.getExternalApiId())
                .autoOddsFetched(match.getAutoOddsFetched())
                .build();
    }
}
