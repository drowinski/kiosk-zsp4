package dev.rowinski.kioskzsp4.asset.dto;

import dev.rowinski.kioskzsp4.asset.model.AssetType;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import org.jspecify.annotations.Nullable;

import java.time.Instant;
import java.util.UUID;

@Builder
public record AssetResponseDTO(
        @NotNull
        UUID id,

        @NotNull
        String mimeType,

        @NotNull
        AssetType type,

        @Nullable
        String description,

        @Nullable
        AssetDateDTO date,

        @NotNull
        Instant createdAt,

        @NotNull
        String createdBy,

        @NotNull
        Instant updatedAt,

        @NotNull
        String updatedBy,

        @Nullable
        Instant publishedAt,

        @Nullable
        String publishedBy,

        @Nullable
        Instant deletedAt,

        @Nullable
        String deletedBy
) {
}
