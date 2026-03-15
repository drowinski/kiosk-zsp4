package dev.rowinski.kioskzsp4.user;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.user")
public record UserProperties(DefaultUserProperties defaultUser) {
    @Validated
    public record DefaultUserProperties(
            @NotBlank
            String username,
            @NotBlank
            String password
    ) {
    }
}
