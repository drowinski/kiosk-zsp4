package dev.rowinski.kioskzsp4.asset.filtering;

import lombok.Builder;
import org.jspecify.annotations.Nullable;

import java.time.LocalDate;

@Builder
public record AssetFilterParams(
        @Nullable
        LocalDate dateOn,

        @Nullable
        LocalDate dateFrom,

        @Nullable
        LocalDate dateTo,

        @Nullable
        String description,

        @Nullable
        AssetFilterStatus status,

        @Nullable
        LocalDate createdAfter,

        @Nullable
        LocalDate createdBefore,

        @Nullable
        LocalDate updatedAfter,

        @Nullable
        LocalDate updatedBefore,

        @Nullable
        LocalDate publishedAfter,

        @Nullable
        LocalDate publishedBefore,

        @Nullable
        LocalDate deletedAfter,

        @Nullable
        LocalDate deletedBefore
) {
}
