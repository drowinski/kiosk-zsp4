package dev.rowinski.kioskzsp4.asset.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

@Embeddable
@Getter
@Setter(AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@Access(AccessType.FIELD)
public class AssetDate {
    @NotNull
    private LocalDate min;

    @NotNull
    private LocalDate max;

    @Enumerated(EnumType.STRING)
    @NotNull
    private AssetDatePrecision precision;

    @NotNull
    private boolean approximate = false;

    public static AssetDate of(LocalDate min, LocalDate max, AssetDatePrecision precision, boolean approximate) {
        LocalDate normalizedMin = switch (precision) {
            case DAY -> min;
            case MONTH -> min.with(TemporalAdjusters.firstDayOfMonth());
            case YEAR -> min.with(TemporalAdjusters.firstDayOfYear());
            case DECADE -> min.withYear((min.getYear() / 10) * 10).withDayOfYear(1);
            case CENTURY -> throw new UnsupportedOperationException("Century handling hasn't been implemented");
        };

        LocalDate normalizedMax = switch (precision) {
            case DAY -> max;
            case MONTH -> max.with(TemporalAdjusters.lastDayOfMonth());
            case YEAR -> max.with(TemporalAdjusters.lastDayOfYear());
            case DECADE -> max.withYear(((max.getYear() / 10) * 10) + 9).with(TemporalAdjusters.lastDayOfYear());
            case CENTURY -> throw new UnsupportedOperationException("Century handling hasn't been implemented");
        };

        AssetDate assetDate = new AssetDate();
        assetDate.setMin(normalizedMin);
        assetDate.setMax(normalizedMax);
        assetDate.setPrecision(precision);
        assetDate.setApproximate(approximate);
        return assetDate;
    }
}
