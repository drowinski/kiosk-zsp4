package dev.rowinski.kioskzsp4.asset.mapping;

import dev.rowinski.kioskzsp4.asset.AssetProperties;
import dev.rowinski.kioskzsp4.asset.dto.AssetDateDTO;
import dev.rowinski.kioskzsp4.asset.dto.AssetResponseDTO;
import dev.rowinski.kioskzsp4.asset.dto.AssetUpdateDTO;
import dev.rowinski.kioskzsp4.asset.model.Asset;
import dev.rowinski.kioskzsp4.asset.model.AssetDate;
import org.jspecify.annotations.Nullable;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;
import org.springframework.beans.factory.annotation.Autowired;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public abstract class AssetMapper {
    @Autowired
    protected AssetProperties assetProperties;

    public abstract AssetResponseDTO toAssetResponseDTO(@Nullable Asset asset);

    @AfterMapping
    protected void setMediaUrl(@Nullable Asset asset, @MappingTarget AssetResponseDTO.AssetResponseDTOBuilder dtoBuilder) {
        if (asset == null) return;
        dtoBuilder.mediaUri(assetProperties.baseMediaUri() + asset.getFileName());
    }

    public abstract Asset fromAssetUpdateDTO(@Nullable AssetUpdateDTO assetUpdateDTO);

    public @Nullable AssetDate fromAssetDateDTO(@Nullable AssetDateDTO assetDateDTO) {
        if (assetDateDTO == null) return null;
        return AssetDate.of(
                assetDateDTO.min(),
                assetDateDTO.max(),
                assetDateDTO.precision(),
                assetDateDTO.isApproximate()
        );
    }
}
