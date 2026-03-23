package dev.rowinski.kioskzsp4.asset.dto;

import jakarta.validation.Valid;
import lombok.Builder;
import org.jspecify.annotations.Nullable;

@Builder
public record AssetUpdateDTO(
        @Nullable
        String description,

        @Valid
        @Nullable
        AssetDateDTO date
) {
}
