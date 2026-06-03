package com.amilla.application.service;

import com.amilla.ports.inbound.ManageMatchUseCase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final ManageMatchUseCase matchUseCase;

    public DatabaseSeeder(ManageMatchUseCase matchUseCase) {
        this.matchUseCase = matchUseCase;
    }

    @Override
    public void run(String... args) {
        try {
            log.info("Running automatic match database seeder...");
            matchUseCase.seedMatchesFromJson();
        } catch (Exception e) {
            log.error("Failed to run database matches seeder", e);
        }
    }
}
