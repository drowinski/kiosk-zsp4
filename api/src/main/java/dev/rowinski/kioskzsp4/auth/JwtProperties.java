package dev.rowinski.kioskzsp4.auth;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.auth.jwt")
public record JwtProperties(
        @NotBlank
        @Size(min = 44, message = "JWT secret must be at least 256 bits (44 Base64 chars)")
        String secret,

        @Min(value = 1)
        int expirationSeconds
) {
}
