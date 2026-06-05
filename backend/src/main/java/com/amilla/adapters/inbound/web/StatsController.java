package com.amilla.adapters.inbound.web;

import com.amilla.adapters.inbound.web.dto.GlobalStatsDto;
import com.amilla.application.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/global")
    public ResponseEntity<GlobalStatsDto> getGlobalStats() {
        return ResponseEntity.ok(statsService.getGlobalStats());
    }
}
