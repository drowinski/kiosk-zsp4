package dev.rowinski.kioskzsp4.asset;

import dev.rowinski.kioskzsp4.asset.dto.AssetCreationDTO;
import dev.rowinski.kioskzsp4.asset.dto.AssetDateDTO;
import dev.rowinski.kioskzsp4.asset.dto.AssetUpdateDTO;
import dev.rowinski.kioskzsp4.asset.exception.AssetNotFoundException;
import dev.rowinski.kioskzsp4.asset.exception.AssetOperationNotAllowed;
import dev.rowinski.kioskzsp4.asset.exception.UnsupportedFileTypeException;
import dev.rowinski.kioskzsp4.asset.mapping.AssetMapper;
import dev.rowinski.kioskzsp4.asset.model.Asset;
import dev.rowinski.kioskzsp4.asset.model.AssetDatePrecision;
import dev.rowinski.kioskzsp4.TestWithSecurity;
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
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;
import java.util.regex.Pattern;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        value = AssetController.class,
        includeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = AssetMapper.class)
)
@ActiveProfiles("test")
public class AssetControllerTest extends TestWithSecurity {
    private final static String ROOT_ENDPOINT = "/api/assets";
    private final static String ID_ENDPOINT = "/api/assets/{id}";
    private final static String PERMANENT_DELETION_ENDPOINT = "/api/assets/{id}/permanent";

    private final static Pattern LOCATION_HEADER_REGEX = Pattern.compile("^" + Pattern.quote(ROOT_ENDPOINT + "/") + "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");

    @MockitoBean
    private AssetService assetService;

    @MockitoBean
    private AssetRepository assetRepository;

    @Autowired
    private ObjectMapper objectMapper;

    /* createAsset */

    @Test
    @WithMockUser
    void createAsset_withValidRequest_returns201WithLocationHeaderAndPayload() throws Exception {
        Asset mockAsset = new Asset();
        mockAsset.setId(UUID.randomUUID());
        when(assetService.storeAsset(any(), any())).thenReturn(mockAsset);

        mockMvc.perform(multipart(ROOT_ENDPOINT)
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
        mockMvc.perform(multipart(ROOT_ENDPOINT)
                        .file(getValidJPEGFile())
                        .file(getInvalidMetadataFile()))
                .andExpect(status().isBadRequest())
                .andExpect(header().doesNotExist("Location"))
                .andExpect(content().string(""));
    }

    @Test
    @WithMockUser
    void createAsset_withMalformedMetadata_returns400() throws Exception {
        mockMvc.perform(multipart(ROOT_ENDPOINT)
                        .file(getValidJPEGFile())
                        .file(getMalformedMetadataFile()))
                .andExpect(status().isBadRequest())
                .andExpect(header().doesNotExist("Location"))
                .andExpect(content().string(""));
    }

    @Test
    @WithMockUser
    void createAsset_withDisallowedContentType_returns415() throws Exception {
        mockMvc.perform(multipart(ROOT_ENDPOINT)
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

        mockMvc.perform(multipart(ROOT_ENDPOINT)
                        .file(getMalformedJPEGFile())
                        .file(getValidMetadataFile()))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(header().doesNotExist("Location"))
                .andExpect(content().string(""));
    }

    /* updateAsset */

    @Test
    @WithMockUser
    void updateAsset_withValidRequest_returns200WithLocationHeaderAndPayload() throws Exception {
        UUID assetId = UUID.randomUUID();
        AssetUpdateDTO assetUpdateDTO = AssetUpdateDTO.builder()
                .description("Some description")
                .date(AssetDateDTO.builder()
                        .min(LocalDate.ofInstant(Instant.now(), ZoneId.systemDefault()))
                        .precision(AssetDatePrecision.YEAR)
                        .build())
                .build();

        Asset mockAsset = new Asset();
        mockAsset.setId(assetId);
        when(assetService.updateAsset(eq(assetId), any())).thenReturn(mockAsset);

        mockMvc.perform(put(ID_ENDPOINT, assetId.toString())
                        .content(serializeToJSON(assetUpdateDTO))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().exists("Location"))
                .andExpect(header().string("Location", Matchers.matchesRegex(LOCATION_HEADER_REGEX)))
                .andExpect(jsonPath("$.id").value(assetId.toString()));
    }

    @Test
    @WithMockUser
    void updateAsset_withNonExistentId_returns404() throws Exception {
        UUID assetId = UUID.randomUUID();
        AssetUpdateDTO assetUpdateDTO = AssetUpdateDTO.builder()
                .description("Some description")
                .date(AssetDateDTO.builder()
                        .min(LocalDate.ofInstant(Instant.now(), ZoneId.systemDefault()))
                        .precision(AssetDatePrecision.YEAR)
                        .build())
                .build();

        when(assetService.updateAsset(eq(assetId), any())).thenThrow(new AssetNotFoundException(assetId));

        mockMvc.perform(put(ID_ENDPOINT, assetId.toString())
                        .content(serializeToJSON(assetUpdateDTO))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(header().doesNotExist("Location"))
                .andExpect(content().string(""));
    }

    /* softDeleteAssetById */

    @Test
    @WithMockUser
    void softDeleteAssetById_withValidId_returns204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete(ID_ENDPOINT, id))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));
    }

    @Test
    @WithMockUser
    void softDeleteAssetById_withNonExistentId_returns404() throws Exception {
        UUID id = UUID.randomUUID();
        doThrow(new AssetNotFoundException(id)).when(assetService).softDeleteAsset(any(), any());

        mockMvc.perform(delete(ID_ENDPOINT, id))
                .andExpect(status().isNotFound())
                .andExpect(content().string(""));
    }

    /* permanentlyDeleteAssetById */

    @Test
    @WithMockUser
    void permanentlyDeleteAssetById_withValidId_returns204() throws Exception {
        UUID id = UUID.randomUUID();

        mockMvc.perform(delete(PERMANENT_DELETION_ENDPOINT, id))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));
    }

    @Test
    @WithMockUser
    void permanentlyDeleteAssetById_withNonExistentId_returns404() throws Exception {
        UUID id = UUID.randomUUID();
        doThrow(new AssetNotFoundException(id)).when(assetService).permanentlyDeleteAsset(any());

        mockMvc.perform(delete(PERMANENT_DELETION_ENDPOINT, id))
                .andExpect(status().isNotFound())
                .andExpect(content().string(""));
    }

    @Test
    @WithMockUser
    void permanentlyDeleteAssetById_whenNotSoftDeleted_returns400() throws Exception {
        UUID id = UUID.randomUUID();
        doThrow(new AssetOperationNotAllowed("Not soft deleted")).when(assetService).permanentlyDeleteAsset(any());

        mockMvc.perform(delete(PERMANENT_DELETION_ENDPOINT, id))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(""));
    }

    /* Helpers */

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

    private String serializeToJSON(AssetUpdateDTO assetUpdateDTO) {
        return objectMapper.writeValueAsString(assetUpdateDTO);
    }
}
