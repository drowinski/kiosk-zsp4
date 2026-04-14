package dev.rowinski.kioskzsp4.asset.seeding;

import lombok.Builder;

import java.time.Instant;

@Builder
public record AssetSeedDTO(
        String fileName,
        String originalFileName,
        String description,
        AssetDateSeedDTO date,
        Instant publishedAt,
        String publishedBy,
        Instant deletedAt,
        String deletedBy
) {
}
