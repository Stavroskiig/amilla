package com.amilla.adapters.config;

import com.amilla.domain.service.PointCalculatorService;
import com.amilla.domain.service.PredictionDomainService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DomainConfig {

    @Bean
    public PointCalculatorService pointCalculatorService() {
        return new PointCalculatorService();
    }

    @Bean
    public PredictionDomainService predictionDomainService() {
        return new PredictionDomainService();
    }
}
