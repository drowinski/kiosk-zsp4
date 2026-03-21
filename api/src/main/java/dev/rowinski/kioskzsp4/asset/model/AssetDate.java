package dev.rowinski.kioskzsp4.asset.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.jspecify.annotations.Nullable;

import java.time.LocalDate;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class AssetDate {
    @NotNull
    private LocalDate min;

    @Nullable
    private LocalDate max;

    @Enumerated(EnumType.STRING)
    @NotNull
    private AssetDatePrecision precision;

    @NotNull
    private boolean isApproximate = false;
}
