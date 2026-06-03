package com.amilla;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class AmillaApplication {

    private static final Logger log = LoggerFactory.getLogger(AmillaApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(AmillaApplication.class, args);
    }

    @Bean
    public CommandLineRunner databaseUniqueConstraintCleanupRunner(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                log.info("Checking database constraints to drop unique constraint on long_term_predictions(user_id)...");
                jdbcTemplate.execute("DO $$\n" +
                        "DECLARE\n" +
                        "    r RECORD;\n" +
                        "BEGIN\n" +
                        "    FOR r IN (\n" +
                        "        SELECT conname \n" +
                        "        FROM pg_constraint \n" +
                        "        WHERE conrelid = 'long_term_predictions'::regclass \n" +
                        "          AND contype = 'u'\n" +
                        "    ) LOOP\n" +
                        "        EXECUTE 'ALTER TABLE long_term_predictions DROP CONSTRAINT ' || quote_ident(r.conname);\n" +
                        "        RAISE NOTICE 'Dropped unique constraint: %', r.conname;\n" +
                        "    END LOOP;\n" +
                        "END $$;");
                log.info("Database constraint check/cleanup completed.");
            } catch (Exception e) {
                log.warn("Could not drop unique constraint on long_term_predictions: " + e.getMessage());
            }
        };
    }
}
