package dev.rowinski.kioskzsp4.asset.dto;

import dev.rowinski.kioskzsp4.asset.model.AssetDatePrecision;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.time.LocalDate;

@Builder
public record AssetDateDTO(
        @NotNull
        LocalDate min,

        @NotNull
        LocalDate max,

        @NotNull
        AssetDatePrecision precision,

        @NotNull
        boolean isApproximate
) {
}
