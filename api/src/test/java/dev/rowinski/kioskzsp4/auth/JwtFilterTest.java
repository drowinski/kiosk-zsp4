package dev.rowinski.kioskzsp4.auth;

import dev.rowinski.kioskzsp4.system.SystemController;
import dev.rowinski.kioskzsp4.user.Role;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(JwtFilterTestController.class)
@Import({WebSecurityConfig.class, JwtFilter.class})
@ActiveProfiles("test")
public class JwtFilterTest {
    private final String PROTECTED_ENDPOINT_URI = "/test/protected";

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    void requestWithoutToken_returns401() throws Exception {
        mockMvc.perform(get(PROTECTED_ENDPOINT_URI))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void requestWithValidToken_returns200() throws Exception {
        when(jwtService.verifyTokenAndExtractClaims(anyString()))
                .thenReturn(new JwtExtractedClaims("admin", List.of(Role.ADMIN)));

        mockMvc.perform(get(PROTECTED_ENDPOINT_URI)
                        .header("Authorization", "Bearer valid.token"))
                .andExpect(status().isOk());
    }

    @Test
    void requestWithInvalidToken_returns401() throws Exception {
        when(jwtService.verifyTokenAndExtractClaims(anyString()))
                .thenThrow(new JwtException("Mock exception"));

        mockMvc.perform(get(PROTECTED_ENDPOINT_URI)
                        .header("Authorization", "Bearer invalid.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void requestWithMalformedAuthorizationHeader_returns401() throws Exception {
        mockMvc.perform(get(PROTECTED_ENDPOINT_URI)
                        .header("Authorization", "MalformedBearer token"))
                .andExpect(status().isUnauthorized());
    }
}
