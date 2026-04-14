package dev.rowinski.kioskzsp4.asset.seeding;

import dev.rowinski.kioskzsp4.asset.model.AssetDatePrecision;
import lombok.Builder;

import java.time.LocalDate;

@Builder
public record AssetDateSeedDTO(
        LocalDate min,
        LocalDate max,
        AssetDatePrecision precision,
        boolean approximate
) {
}
