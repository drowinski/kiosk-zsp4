package dev.rowinski.kioskzsp4.asset;

import dev.rowinski.kioskzsp4.asset.exceptions.AssetOperationNotAllowed;
import dev.rowinski.kioskzsp4.asset.exceptions.UnsupportedFileTypeException;
import dev.rowinski.kioskzsp4.asset.model.Asset;
import dev.rowinski.kioskzsp4.asset.model.AssetType;
import org.apache.tika.Tika;
import org.apache.tika.mime.MimeTypes;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AssetServiceTest {
    @TempDir
    public Path tempDir;

    private AssetService assetService;
    private AssetRepository assetRepository;

    @BeforeEach
    public void setUp() {
        assetRepository = mock(AssetRepository.class);
        AssetProperties assetProperties = new AssetProperties(tempDir, "/irrelevant");
        assetService = new AssetService(assetProperties,
                assetRepository,
                Clock.systemUTC(),
                new Tika(),
                MimeTypes.getDefaultMimeTypes());
        when(assetRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void storeAsset_withValidArguments_returnsAsset() throws IOException {
        String originalFileName = "originalFileName.jpg";

        try (InputStream inputStream = AssetControllerTest.class.getResourceAsStream("test-file.jpg")) {
            assertThat(inputStream).isNotNull();

            Asset result = assetService.storeAsset(inputStream, originalFileName, null, null);

            assertThat(result.getId()).isNotNull();
            assertThat(result.getFileName()).isIn(List.of(result.getId() + ".jpg", result.getId() + ".jpeg"));
            assertThat(result.getOriginalFileName()).isEqualTo(originalFileName);
            assertThat(result.getMimeType()).isEqualTo("image/jpeg");
            assertThat(result.getType()).isEqualTo(AssetType.IMAGE);
            assertThat(Files.exists(tempDir.resolve(result.getFileName()))).isTrue();
        }
    }

    @Test
    void storeAsset_withUnsupportedMimeType_throwsUnsupportedFileTypeException() throws IOException {
        try (InputStream inputStream = AssetControllerTest.class.getResourceAsStream("unsupported-file.sql")) {
            assertThat(inputStream).isNotNull();

            assertThatThrownBy(() -> assetService.storeAsset(inputStream, null, null, null))
                    .isInstanceOf(UnsupportedFileTypeException.class);
            verify(assetRepository, never()).save(any());
            try (Stream<Path> tempDirStream = Files.list(tempDir)) {
                assertThat(tempDirStream.findAny()).isEmpty();
            }
        }
    }

    @Test
    void storeAsset_whenRepositoryThrowsException_cleansUpFileAndPropagatesException() throws IOException {
        when(assetRepository.save(any())).thenThrow(new RuntimeException());
        try (InputStream inputStream = AssetControllerTest.class.getResourceAsStream("test-file.jpg")) {
            assertThat(inputStream).isNotNull();

            assertThatThrownBy(() -> assetService.storeAsset(inputStream, null, null, null))
                    .isInstanceOf(RuntimeException.class);
            try (Stream<Path> tempDirStream = Files.list(tempDir)) {
                assertThat(tempDirStream.findAny()).isEmpty();
            }
        }
    }

    @Test
    void permanentlyDeleteAsset_withValidArguments_deletesRecordAndFile() throws IOException {
        Path assetFile = tempDir.resolve("test-file.jpg");
        Files.createFile(assetFile);

        Asset asset = new Asset();
        asset.setId(UUID.randomUUID());
        asset.setFileName(assetFile.getFileName().toString());
        asset.setDeletedAt(Instant.now());
        asset.setDeletedBy("MockUser");

        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));

        assetService.permanentlyDeleteAsset(asset.getId());

        assertThat(Files.exists(assetFile)).isFalse();
    }

    @Test
    void permanentlyDeleteAsset_whenRepositoryThrowsException_doesNotDeleteFile() throws IOException {
        Path assetFile = tempDir.resolve("test-file.jpg");
        Files.createFile(assetFile);

        Asset asset = new Asset();
        asset.setId(UUID.randomUUID());
        asset.setFileName(assetFile.getFileName().toString());
        asset.setDeletedAt(Instant.now());
        asset.setDeletedBy("MockUser");

        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));
        doThrow(new RuntimeException("DB Error")).when(assetRepository).delete(asset);

        assertThatThrownBy(() -> assetService.permanentlyDeleteAsset(asset.getId()))
                .isInstanceOf(RuntimeException.class);

        assertThat(Files.exists(assetFile)).isTrue();
    }

    @Test
    void permanentlyDeleteAsset_whenNotSoftDeleted_doesNotDeleteAndThrowsException() throws IOException {
        Path assetFile = tempDir.resolve("test-file.jpg");
        Files.createFile(assetFile);

        Asset asset = new Asset();
        asset.setId(UUID.randomUUID());
        asset.setFileName(assetFile.getFileName().toString());

        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));

        assertThatThrownBy(() -> assetService.permanentlyDeleteAsset(asset.getId()))
                .isInstanceOf(AssetOperationNotAllowed.class);

        verify(assetRepository, never()).delete(any(Asset.class));
        assertThat(Files.exists(assetFile)).isTrue();
    }
}
