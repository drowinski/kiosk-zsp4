package dev.rowinski.kioskzsp4.asset;

import dev.rowinski.kioskzsp4.asset.dto.AssetCreationDTO;
import dev.rowinski.kioskzsp4.asset.dto.AssetResponseDTO;
import dev.rowinski.kioskzsp4.asset.dto.AssetUpdateDTO;
import dev.rowinski.kioskzsp4.asset.exception.AssetFileException;
import dev.rowinski.kioskzsp4.asset.exception.AssetNotFoundException;
import dev.rowinski.kioskzsp4.asset.exception.AssetOperationNotAllowed;
import dev.rowinski.kioskzsp4.asset.exception.UnsupportedFileTypeException;
import dev.rowinski.kioskzsp4.asset.mapping.AssetMapper;
import dev.rowinski.kioskzsp4.asset.model.Asset;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URI;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {
    private final AssetMapper assetMapper;
    private final AssetRepository assetRepository; // TODO: Decouple repository from controller
    private final AssetService assetService;

    // TODO: Implement proper endpoint with sorting and filtering, delegating through the service layer
    @GetMapping
    public ResponseEntity<Page<AssetResponseDTO>> getAllAssets(
            @PageableDefault(size = 50, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(assetRepository.findAll(pageable).map(assetMapper::toAssetResponseDTO));
    }

    // TODO: Implement proper endpoint with filtering, delegating through the service layer
    @GetMapping("/{id}")
    public ResponseEntity<AssetResponseDTO> getAssetById(@PathVariable UUID id) {
        return assetRepository.findById(id)
                .map(assetMapper::toAssetResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AssetResponseDTO> createAsset(
            @Valid @RequestPart("metadata") AssetCreationDTO assetCreationDTO,
            @RequestPart("file") MultipartFile file
    ) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        if (!List.of(
                "image/jpeg",
                "image/png",
                "video/mp4",
                "application/pdf"
        ).contains(file.getContentType())) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).build();
        }

        Asset asset = assetMapper.fromAssetCreationDTO(assetCreationDTO);
        asset.setOriginalFileName(file.getOriginalFilename());

        try (InputStream inputStream = file.getInputStream()) {
            asset = assetService.storeAsset(asset, inputStream);
        } catch (UnsupportedFileTypeException e) {
            log.debug(e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).build();
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }

        return ResponseEntity
                .created(URI.create("/api/assets/%s".formatted(asset.getId())))
                .body(assetMapper.toAssetResponseDTO(asset));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AssetResponseDTO> updateAsset(@PathVariable UUID id, @Valid @RequestBody AssetUpdateDTO assetUpdateDTO) {

        Asset asset;
        try {
            asset = assetService.updateAsset(id, assetMapper.fromAssetUpdateDTO(assetUpdateDTO));
        } catch (AssetNotFoundException e) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity
                .status(HttpStatus.OK)
                .location(URI.create("/api/assets/%s".formatted(asset.getId())))
                .body(assetMapper.toAssetResponseDTO(asset));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDeleteAssetById(@PathVariable UUID id, Authentication authentication) {
        try {
            assetService.softDeleteAsset(id, authentication.getName());
        } catch (AssetNotFoundException e) {
            log.debug(e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Void> restoreAssetById(@PathVariable UUID id) {
        try {
            assetService.restoreAsset(id);
        } catch (AssetNotFoundException e) {
            log.debug(e.getMessage(), e);
            return ResponseEntity.notFound().build();
        } catch (AssetOperationNotAllowed e) {
            log.debug(e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<Void> permanentlyDeleteAssetById(@PathVariable UUID id) {
        try {
            assetService.permanentlyDeleteAsset(id);
        } catch (AssetNotFoundException e) {
            log.debug(e.getMessage(), e);
            return ResponseEntity.notFound().build();
        } catch (AssetOperationNotAllowed e) {
            log.debug(e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        } catch (AssetFileException e) {
            log.error(e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }

        return ResponseEntity.noContent().build();
    }
}
