package dev.rowinski.kioskzsp4.asset.mapping;

import dev.rowinski.kioskzsp4.asset.dto.AssetDateDTO;
import dev.rowinski.kioskzsp4.asset.dto.AssetResponseDTO;
import dev.rowinski.kioskzsp4.asset.dto.AssetUpdateDTO;
import dev.rowinski.kioskzsp4.asset.model.Asset;
import dev.rowinski.kioskzsp4.asset.model.AssetDate;
import org.jspecify.annotations.Nullable;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AssetMapper {
    AssetResponseDTO toAssetResponseDTO(@Nullable Asset asset);

    Asset fromAssetUpdateDTO(@Nullable AssetUpdateDTO assetUpdateDTO);

    default @Nullable AssetDate fromAssetDateDTO(@Nullable AssetDateDTO assetDateDTO) {
        if (assetDateDTO == null) return null;
        return AssetDate.of(
                assetDateDTO.min(),
                assetDateDTO.max(),
                assetDateDTO.precision(),
                assetDateDTO.isApproximate()
        );
    }
}
