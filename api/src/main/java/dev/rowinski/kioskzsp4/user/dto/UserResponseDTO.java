package dev.rowinski.kioskzsp4.user.dto;

import dev.rowinski.kioskzsp4.user.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record UserResponseDTO(
        @NotNull
        Long id,

        @NotNull
        String username,

        @NotNull
        Role role
) {
}
