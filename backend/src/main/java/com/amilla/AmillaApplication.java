package com.amilla;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AmillaApplication {

    private static final Logger log = LoggerFactory.getLogger(AmillaApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(AmillaApplication.class, args);
    }
}
