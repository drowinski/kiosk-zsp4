package dev.rowinski.kioskzsp4.user;

import org.springframework.security.core.GrantedAuthority;

public enum Role {
    ADMIN, STAFF, KIOSK;

    public static boolean isRole(GrantedAuthority authority) {
        return authority.getAuthority() != null && authority.getAuthority().startsWith("ROLE_");
    }

    public static Role fromAuthority(GrantedAuthority authority) {
        String authorityName = authority.getAuthority();
        if (authorityName == null || !authorityName.startsWith("ROLE_")) {
            throw new IllegalArgumentException("Authority needs to start with 'ROLE_'. Got: " + authorityName);
        }
        return Role.valueOf(authorityName.substring("ROLE_".length()));
    }
}
