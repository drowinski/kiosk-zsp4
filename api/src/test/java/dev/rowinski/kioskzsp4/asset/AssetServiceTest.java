package dev.rowinski.kioskzsp4.asset;

import dev.rowinski.kioskzsp4.asset.exception.UnsupportedFileTypeException;
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
import java.util.List;
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
        AssetProperties assetProperties = new AssetProperties(tempDir);
        assetService = new AssetService(assetProperties, assetRepository, new Tika(), MimeTypes.getDefaultMimeTypes());
        when(assetRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void storeAsset_withValidArguments_returnsAsset() throws IOException {
        Asset asset = new Asset();
        asset.setOriginalFileName("originalFileName.jpg");
        try (InputStream inputStream = AssetControllerTest.class.getResourceAsStream("test-file.jpg")) {
            assertThat(inputStream).isNotNull();

            Asset result = assetService.storeAsset(asset, inputStream);

            assertThat(result.getId()).isNotNull();
            assertThat(result.getFileName()).isIn(List.of(result.getId() + ".jpg", result.getId() + ".jpeg"));
            assertThat(result.getOriginalFileName()).isEqualTo(asset.getOriginalFileName());
            assertThat(result.getMimeType()).isEqualTo("image/jpeg");
            assertThat(result.getType()).isEqualTo(AssetType.IMAGE);
            assertThat(Files.exists(tempDir.resolve(result.getFileName()))).isTrue();
        }
    }

    @Test
    void storeAsset_withUnsupportedMimeType_throwsUnsupportedFileTypeException() throws IOException {
        Asset asset = new Asset();
        try (InputStream inputStream = AssetControllerTest.class.getResourceAsStream("unsupported-file.sql")) {
            assertThat(inputStream).isNotNull();

            assertThatThrownBy(() -> assetService.storeAsset(asset, inputStream))
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

            assertThatThrownBy(() -> assetService.storeAsset(new Asset(), inputStream))
                    .isInstanceOf(RuntimeException.class);
            try (Stream<Path> tempDirStream = Files.list(tempDir)) {
                assertThat(tempDirStream.findAny()).isEmpty();
            }
        }
    }
}
