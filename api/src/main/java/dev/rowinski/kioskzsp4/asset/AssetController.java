package dev.rowinski.kioskzsp4.asset;

import dev.rowinski.kioskzsp4.asset.dto.AssetCreationDTO;
import dev.rowinski.kioskzsp4.asset.dto.AssetResponseDTO;
import dev.rowinski.kioskzsp4.asset.dto.AssetUpdateDTO;
import dev.rowinski.kioskzsp4.asset.exceptions.AssetFileException;
import dev.rowinski.kioskzsp4.asset.exceptions.AssetNotFoundException;
import dev.rowinski.kioskzsp4.asset.exceptions.AssetOperationNotAllowed;
import dev.rowinski.kioskzsp4.asset.exceptions.AssetTypeNotSupportedException;
import dev.rowinski.kioskzsp4.asset.filtering.AssetFilterParams;
import dev.rowinski.kioskzsp4.asset.mapping.AssetMapper;
import dev.rowinski.kioskzsp4.asset.model.Asset;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {
    private final AssetMapper assetMapper;
    private final AssetService assetService;

    @PostMapping
    public ResponseEntity<AssetResponseDTO> createAsset(
            @Valid @RequestPart("metadata") AssetCreationDTO assetCreationDTO,
            @RequestPart("file") MultipartFile file
    ) throws IOException {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        if (!AssetMimeTypes.isSupported(file.getContentType())) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).build();
        }

        Asset asset;
        try (InputStream inputStream = file.getInputStream()) {
            asset = assetService.storeAsset(
                    inputStream,
                    file.getOriginalFilename(),
                    assetCreationDTO.description(),
                    assetMapper.fromAssetDateDTO(assetCreationDTO.date())
            );
        }

        return ResponseEntity
                .created(URI.create("/api/assets/%s".formatted(asset.getId())))
                .body(assetMapper.toAssetResponseDTO(asset));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetResponseDTO> getAsset(@PathVariable UUID id) {
        return assetService.getAssetById(id)
                .map(assetMapper::toAssetResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<Page<AssetResponseDTO>> getAssets(
            AssetFilterParams filterParams,
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(assetService.getAssets(filterParams, pageable).map(assetMapper::toAssetResponseDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssetResponseDTO> updateAsset(@PathVariable UUID id, @Valid @RequestBody AssetUpdateDTO assetUpdateDTO) {
        Asset asset = assetService.updateAsset(id, assetUpdateDTO.description(), assetMapper.fromAssetDateDTO(assetUpdateDTO.date()));
        return ResponseEntity
                .status(HttpStatus.OK)
                .location(URI.create("/api/assets/%s".formatted(asset.getId())))
                .body(assetMapper.toAssetResponseDTO(asset));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<AssetResponseDTO> publishAsset(@PathVariable UUID id, Authentication authentication) {
        Asset asset = assetService.setAssetPublishedStatus(id, true, authentication.getName());
        return ResponseEntity.ok(assetMapper.toAssetResponseDTO(asset));
    }

    @PostMapping("/{id}/unpublish")
    public ResponseEntity<AssetResponseDTO> unpublishAsset(@PathVariable UUID id, Authentication authentication) {
        Asset asset = assetService.setAssetPublishedStatus(id, false, authentication.getName());
        return ResponseEntity.ok(assetMapper.toAssetResponseDTO(asset));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteAsset(@PathVariable UUID id, Authentication authentication) {
        assetService.softDeleteAsset(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Void> restoreAsset(@PathVariable UUID id) {
        assetService.restoreAsset(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Void> permanentlyDeleteAsset(@PathVariable UUID id) {
        assetService.permanentlyDeleteAsset(id);
        return ResponseEntity.noContent().build();
    }
}
