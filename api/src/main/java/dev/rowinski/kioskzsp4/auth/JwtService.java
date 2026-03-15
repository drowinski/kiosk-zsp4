package dev.rowinski.kioskzsp4.auth;

import dev.rowinski.kioskzsp4.user.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JwtService {
    private final String applicationName;
    private final JwtProperties jwtProperties;
    private final SecretKey key;

    public JwtService(@Value("${spring.application.name}") String applicationName, JwtProperties jwtProperties) {
        this.applicationName = applicationName;
        this.jwtProperties = jwtProperties;
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtProperties.secret()));
    }

    public String generateToken(String username, List<Role> roles) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(applicationName)
                .subject(username)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(jwtProperties.expirationSeconds())))
                .claim("roles", roles.stream().map(Enum::name).toList())
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public JwtExtractedClaims verifyTokenAndExtractClaims(String token) {
        Claims claims = parseToken(token);
        @SuppressWarnings("unchecked") // List of Strings created in `generateToken()`
        List<String> roleNames = claims.get("roles", List.class);
        List<Role> authorities = roleNames == null ? List.of() :
                roleNames.stream()
                        .map(roleName -> {
                            try {
                                return Role.valueOf(roleName);
                            } catch (IllegalArgumentException e) {
                                throw new JwtException("Invalid role name in token: " + roleName);
                            }
                        })
                        .collect(Collectors.toList());
        return new JwtExtractedClaims(claims.getSubject(), authorities);
    }

    private Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
