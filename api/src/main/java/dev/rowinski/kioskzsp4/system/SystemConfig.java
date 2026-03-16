package dev.rowinski.kioskzsp4.system;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class SystemConfig {
    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
