package dev.rowinski.kioskzsp4.asset;

import dev.rowinski.kioskzsp4.asset.exceptions.AssetFileException;
import dev.rowinski.kioskzsp4.asset.exceptions.AssetNotFoundException;
import dev.rowinski.kioskzsp4.asset.exceptions.AssetOperationNotAllowed;
import dev.rowinski.kioskzsp4.asset.filtering.AssetFilterParams;
import dev.rowinski.kioskzsp4.asset.filtering.AssetFilterSpecificationBuilder;
import dev.rowinski.kioskzsp4.asset.model.Asset;
import dev.rowinski.kioskzsp4.asset.model.AssetDate;
import dev.rowinski.kioskzsp4.asset.model.AssetType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.apache.tika.mime.MimeType;
import org.apache.tika.mime.MimeTypeException;
import org.apache.tika.mime.MimeTypes;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssetService {
    private final AssetProperties assetProperties;
    private final AssetRepository assetRepository;
    private final Clock clock;
    private final Tika tika;
    private final MimeTypes mimeTypes;

    public Asset storeAsset(
            InputStream inputStream,
            @Nullable String originalFileName,
            @Nullable String description,
            @Nullable AssetDate assetDate
    ) {
        UUID assetId = UUID.randomUUID();

        StoreAssetFileResult storeResult;
        try {
            storeResult = storeAssetFile(inputStream, assetId);
        } catch (AssetFileException exception) {
            log.error(exception.getMessage(), exception);
            throw exception;
        }

        try {
            Asset asset = new Asset();
            asset.setId(assetId);
            asset.setFileName(storeResult.destinationPath().getFileName().toString());
            asset.setOriginalFileName(originalFileName);
            asset.setMimeType(storeResult.mimeType());
            asset.setType(AssetType.fromMimeType(storeResult.mimeType()));
            asset.setDescription(description);
            asset.setDate(assetDate);

            return assetRepository.save(asset);
        } catch (RuntimeException exception1) {
            log.error("Unable to save asset to repository. Asset ID: {}", assetId, exception1);
            try {
                log.warn("Attempting orphaned file cleanup...");
                deleteAssetFile(storeResult.destinationPath().getFileName().toString());
            } catch (AssetFileException exception2) {
                log.warn("Unable to delete orphaned asset file {}", storeResult.destinationPath().getFileName(), exception2);
            }
            throw exception1;
        }
    }

    private record StoreAssetFileResult(Path destinationPath, String mimeType) {
    }

    private StoreAssetFileResult storeAssetFile(InputStream inputStream, UUID assetId) {
        try {
            byte[] header = inputStream.readNBytes(8192);

            if (header.length == 0) {
                throw new AssetFileException("Input stream is empty");
            }

            String mimeTypeString = tika.detect(header);
            MimeType mimeType = mimeTypes.forName(mimeTypeString);
            Path destinationPath = getSafeFilePath(assetId + mimeType.getExtension());

            try (OutputStream outputStream = Files.newOutputStream(destinationPath)) {
                outputStream.write(header);
                inputStream.transferTo(outputStream);
            }

            return new StoreAssetFileResult(destinationPath, mimeTypeString);
        } catch (IOException e) {
            throw new AssetFileException("IO exception while trying to save asset file", e);
        } catch (MimeTypeException e) {
            throw new AssetFileException("Mime type exception while trying to save asset file", e);
        }
    }

    public Optional<Asset> getAssetById(UUID assetId) {
        return assetRepository.findById(assetId);
    }

    public Page<Asset> getAssets(AssetFilterParams filterParams, Pageable pageable) {
        return assetRepository.findAll(AssetFilterSpecificationBuilder.fromFilterParams(filterParams), pageable);
    }

    @Transactional
    public Asset updateAsset(UUID assetId, @Nullable String description, @Nullable AssetDate assetDate) {
        Asset asset = assetRepository.findById(assetId).orElseThrow(() -> new AssetNotFoundException(assetId));
        asset.setDescription(description);
        asset.setDate(assetDate);
        return asset;
    }

    @Transactional
    public void softDeleteAsset(UUID assetId, String deletedBy) {
        Asset asset = assetRepository.findById(assetId).orElseThrow(() -> new AssetNotFoundException(assetId));
        asset.setDeletedAt(Instant.now(clock));
        asset.setDeletedBy(deletedBy);
    }

    @Transactional
    public void restoreAsset(UUID assetId) {
        Asset asset = assetRepository.findById(assetId).orElseThrow(() -> new AssetNotFoundException(assetId));
        if (asset.getDeletedAt() == null) {
            throw new AssetOperationNotAllowed("Asset needs to be soft deleted before it can be restored");
        }
        asset.setDeletedAt(null);
        asset.setDeletedBy(null);
    }

    @Transactional
    public void permanentlyDeleteAsset(UUID assetId) {
        Asset asset = assetRepository.findById(assetId).orElseThrow(() -> new AssetNotFoundException(assetId));
        if (asset.getDeletedAt() == null) {
            throw new AssetOperationNotAllowed("Asset needs to be soft deleted before permanent deletion");
        }
        assetRepository.delete(asset);
        deleteAssetFile(asset.getFileName());
    }

    private void deleteAssetFile(String fileName) {
        try {
            Files.delete(getSafeFilePath(fileName));
        } catch (IOException e) {
            throw new AssetFileException("Unable to delete asset file", e);
        }
    }

    private Path getSafeFilePath(String fileName) {
        Path safePath = assetProperties.rootDirectory()
                .resolve(fileName)
                .normalize()
                .toAbsolutePath();

        if (!safePath.getParent().startsWith(assetProperties.rootDirectory())) {
            throw new AssetFileException("Destination path is outside the root directory");
        }

        return safePath;
    }
}
