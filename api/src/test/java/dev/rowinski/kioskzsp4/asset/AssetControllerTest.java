package dev.rowinski.kioskzsp4.asset;

import dev.rowinski.kioskzsp4.asset.dto.AssetCreationDTO;
import dev.rowinski.kioskzsp4.asset.dto.AssetDateDTO;
import dev.rowinski.kioskzsp4.asset.exception.UnsupportedFileTypeException;
import dev.rowinski.kioskzsp4.asset.mapping.AssetMapper;
import dev.rowinski.kioskzsp4.asset.model.Asset;
import dev.rowinski.kioskzsp4.asset.model.AssetDatePrecision;
import dev.rowinski.kioskzsp4.auth.JwtFilter;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;
import java.util.regex.Pattern;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        value = AssetController.class,
        includeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = AssetMapper.class),
        excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = JwtFilter.class)
)
@ActiveProfiles("test")
public class AssetControllerTest {
    private final static String ASSET_ENDPOINT = "/api/assets";

    private final static Pattern LOCATION_HEADER_REGEX = Pattern.compile("^" + Pattern.quote(ASSET_ENDPOINT + "/") + "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");

    @MockitoBean
    private AssetService assetService;

    @MockitoBean
    private AssetRepository assetRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser
    void createAsset_withValidRequest_returns201WithLocationHeaderAndPayload() throws Exception {
        Asset mockAsset = new Asset();
        mockAsset.setId(UUID.randomUUID());
        when(assetService.storeAsset(any(), any())).thenReturn(mockAsset);

        mockMvc.perform(multipart(ASSET_ENDPOINT)
                        .file(getValidJPEGFile())
                        .file(getValidMetadataFile()))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(header().string("Location", Matchers.matchesRegex(LOCATION_HEADER_REGEX)))
                .andExpect(jsonPath("$.id").value(mockAsset.getId().toString()));
    }

    @Test
    @WithMockUser
    void createAsset_withInvalidMetadata_returns400() throws Exception {
        mockMvc.perform(multipart(ASSET_ENDPOINT)
                        .file(getValidJPEGFile())
                        .file(getInvalidMetadataFile()))
                .andExpect(status().isBadRequest())
                .andExpect(header().doesNotExist("Location"))
                .andExpect(content().string(""));
    }

    @Test
    @WithMockUser
    void createAsset_withMalformedMetadata_returns400() throws Exception {
        mockMvc.perform(multipart(ASSET_ENDPOINT)
                        .file(getValidJPEGFile())
                        .file(getMalformedMetadataFile()))
                .andExpect(status().isBadRequest())
                .andExpect(header().doesNotExist("Location"))
                .andExpect(content().string(""));
    }

    @Test
    @WithMockUser
    void createAsset_withDisallowedContentType_returns415() throws Exception {
        mockMvc.perform(multipart(ASSET_ENDPOINT)
                        .file(getFileWithDisallowedContentType())
                        .file(getValidMetadataFile()))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(header().doesNotExist("Location"))
                .andExpect(content().string(""));
    }

    @Test
    @WithMockUser
    void createAsset_withMalformedMediaFile_returns415() throws Exception {
        when(assetService.storeAsset(any(), any())).thenThrow(new UnsupportedFileTypeException("Mock message"));

        mockMvc.perform(multipart(ASSET_ENDPOINT)
                        .file(getMalformedJPEGFile())
                        .file(getValidMetadataFile()))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(header().doesNotExist("Location"))
                .andExpect(content().string(""));
    }

    private MockMultipartFile getValidMetadataFile() {
        AssetCreationDTO assetCreationDTO = AssetCreationDTO.builder()
                .description("Some description")
                .date(AssetDateDTO.builder()
                        .min(LocalDate.ofInstant(Instant.now(), ZoneId.systemDefault()))
                        .max(null)
                        .precision(AssetDatePrecision.DAY)
                        .isApproximate(false)
                        .build())
                .build();

        return new MockMultipartFile(
                "metadata",
                "",
                MediaType.APPLICATION_JSON_VALUE,
                serializeToJSON(assetCreationDTO).getBytes()
        );
    }

    private MockMultipartFile getInvalidMetadataFile() {
        @SuppressWarnings("DataFlowIssue")
        AssetCreationDTO assetCreationDTO = AssetCreationDTO.builder()
                .description("Some description")
                .date(AssetDateDTO.builder()
                        .min(null)
                        .max(null)
                        .precision(AssetDatePrecision.DAY)
                        .isApproximate(false)
                        .build())
                .build();

        return new MockMultipartFile(
                "metadata",
                "",
                MediaType.APPLICATION_JSON_VALUE,
                serializeToJSON(assetCreationDTO).getBytes()
        );
    }

    private MockMultipartFile getMalformedMetadataFile() {
        return new MockMultipartFile(
                "metadata",
                "",
                MediaType.APPLICATION_JSON_VALUE,
                "not json".getBytes()
        );
    }

    private MockMultipartFile getValidJPEGFile() throws IOException {
        return new MockMultipartFile(
                "file",
                "test-file.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                loadTestFile("test-file.jpg")
        );
    }

    private MockMultipartFile getFileWithDisallowedContentType() throws IOException {
        return new MockMultipartFile(
                "file",
                "unsupported-file.7z",
                "application/x-7z-compressed",
                loadTestFile("test-file.jpg")
        );
    }

    private MockMultipartFile getMalformedJPEGFile() {
        return new MockMultipartFile(
                "file",
                "malformed-file.jpg",
                MediaType.IMAGE_JPEG_VALUE,
                "not a jpeg".getBytes()
        );
    }

    private byte[] loadTestFile(String filePath) throws IOException {
        InputStream inputStream = AssetControllerTest.class.getResourceAsStream(filePath);
        if (inputStream == null) throw new IllegalStateException(filePath + " not found");
        try (inputStream) {
            return inputStream.readAllBytes();
        }
    }

    private String serializeToJSON(AssetCreationDTO assetCreationDTO) {
        return objectMapper.writeValueAsString(assetCreationDTO);
    }

}
