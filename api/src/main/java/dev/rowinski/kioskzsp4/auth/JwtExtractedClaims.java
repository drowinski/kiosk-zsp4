package dev.rowinski.kioskzsp4.auth;

import dev.rowinski.kioskzsp4.user.Role;

import java.util.List;

public record JwtExtractedClaims(
        String username,
        List<Role> roles
) {
}
