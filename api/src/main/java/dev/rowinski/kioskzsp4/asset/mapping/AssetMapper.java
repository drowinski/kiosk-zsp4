package dev.rowinski.kioskzsp4.asset.mapping;

import dev.rowinski.kioskzsp4.asset.dto.AssetCreationDTO;
import dev.rowinski.kioskzsp4.asset.dto.AssetResponseDTO;
import dev.rowinski.kioskzsp4.asset.model.Asset;
import org.jspecify.annotations.Nullable;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AssetMapper {
    AssetResponseDTO toAssetResponseDTO(@Nullable Asset asset);
    Asset fromAssetCreationDTO(@Nullable AssetCreationDTO assetCreationDTO);
}
