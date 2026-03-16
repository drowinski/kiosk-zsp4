package dev.rowinski.kioskzsp4.auth;

import dev.rowinski.kioskzsp4.user.Role;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(SpringExtension.class)
@EnableConfigurationProperties(JwtProperties.class)
@TestPropertySource("classpath:application-test.properties")
public class JwtServiceTest {
    @Autowired
    private JwtProperties jwtProperties;

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService("kiosk-zsp4", jwtProperties, Clock.systemUTC());
    }

    @Test
    void generateToken_containsCorrectUsername() {
        String token = jwtService.generateToken("admin", List.of(Role.ADMIN));
        JwtExtractedClaims claims = jwtService.verifyTokenAndExtractClaims(token);
        assertThat(claims.username()).isEqualTo("admin");
    }

    @Test
    void generateToken_containsCorrectRoles() {
        String token = jwtService.generateToken("admin", List.of(Role.ADMIN, Role.STAFF));
        JwtExtractedClaims claims = jwtService.verifyTokenAndExtractClaims(token);
        assertThat(claims.roles()).containsExactlyInAnyOrder(Role.ADMIN, Role.STAFF);
    }

    @Test
    void verifyToken_withExpiredToken_throwsJwtException() {
        Clock pastClock = Clock.fixed(
                Instant.now().minusSeconds(jwtProperties.expirationSeconds() + 1), ZoneOffset.UTC
        );
        JwtService pastService = new JwtService("kiosk-zsp4", jwtProperties, pastClock);
        String token = pastService.generateToken("admin", List.of(Role.ADMIN));

        assertThatThrownBy(() -> jwtService.verifyTokenAndExtractClaims(token))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void verifyToken_withTamperedToken_throwsJwtException() {
        String token = jwtService.generateToken("admin", List.of(Role.ADMIN));
        String tamperedToken = token.substring(0, token.length() - 5) + "XXXXX";

        assertThatThrownBy(() -> jwtService.verifyTokenAndExtractClaims(tamperedToken))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void verifyToken_withTokenFromDifferentSecret_throwsJwtException() {
        JwtProperties jwtPropertiesWithDifferentSecret = new JwtProperties(
                "ZGlmZmVyZW50c2VjcmV0a2V5dGhhdGlzbG9uZ2Vub3VnaAo=",
                jwtProperties.expirationSeconds()
        );
        JwtService serviceWithDifferentSecret = new JwtService("kiosk-zsp4", jwtPropertiesWithDifferentSecret, Clock.systemUTC());
        String token = serviceWithDifferentSecret.generateToken("admin", List.of(Role.ADMIN));

        assertThatThrownBy(() -> jwtService.verifyTokenAndExtractClaims(token))
                .isInstanceOf(JwtException.class);
    }
}
