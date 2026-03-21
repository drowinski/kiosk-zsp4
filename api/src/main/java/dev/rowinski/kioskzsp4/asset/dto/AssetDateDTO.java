package dev.rowinski.kioskzsp4.asset.dto;

import dev.rowinski.kioskzsp4.asset.model.AssetDatePrecision;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import org.jspecify.annotations.Nullable;

import java.time.LocalDate;

@Builder
public record AssetDateDTO(
        @NotNull
        LocalDate min,

        @Nullable
        LocalDate max,

        @NotNull
        AssetDatePrecision precision,

        @NotNull
        boolean isApproximate
) {
}
