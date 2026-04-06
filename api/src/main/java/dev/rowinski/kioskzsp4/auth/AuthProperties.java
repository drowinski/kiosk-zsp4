package dev.rowinski.kioskzsp4.auth;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Validated
@ConfigurationProperties(prefix = "app.auth")
public record AuthProperties(JwtProperties jwt, CorsProperties cors) {
    public AuthProperties {
        //noinspection ConstantValue
        if (cors == null) {
            cors = new CorsProperties(List.of());
        }
    }

    @Validated
    public record JwtProperties(
            @NotBlank
            @Size(min = 44, message = "JWT secret must be at least 256 bits (44 Base64 chars)")
            String secret,

            @Min(value = 1)
            int expirationSeconds
    ) {
    }

    @Validated
    public record CorsProperties(
            @DefaultValue("[]")
            List<String> allowedOrigins
    ) {
    }
}
