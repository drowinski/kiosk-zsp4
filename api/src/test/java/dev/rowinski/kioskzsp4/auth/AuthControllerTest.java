package dev.rowinski.kioskzsp4.auth;

import dev.rowinski.kioskzsp4.user.Role;
import dev.rowinski.kioskzsp4.user.UserProperties;
import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({AuthConfig.class, JwtFilter.class})
@ActiveProfiles("test")
public class AuthControllerTest {
    private final String LOGIN_ENDPOINT = "/api/auth/login";
    private final String REFRESH_ENDPOINT = "/api/auth/refresh";

    @Autowired
    private UserProperties userProperties;
    private String validUsername;
    private String validPassword;

    @Autowired
    private WebApplicationContext context;

    @MockitoBean
    private AuthenticationManager authenticationManager;

    @MockitoBean
    private JwtService jwtService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        validUsername = userProperties.defaultUser().username();
        validPassword = userProperties.defaultUser().password();
    }

    @Test
    void login_withValidCredentials_returns200WithToken() throws Exception {
        User userDetails = new User(validUsername, "", List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                userDetails, validPassword, userDetails.getAuthorities()
        );

        when(authenticationManager.authenticate(any())).thenReturn(authenticationToken);
        when(jwtService.generateToken(any(), any())).thenReturn("mock.token");

        mockMvc.perform(post(LOGIN_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(getLoginRequestContent(validUsername, validPassword)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock.token"));
    }

    @Test
    void login_withInvalidCredentials_returns401() throws Exception {
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post(LOGIN_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(getLoginRequestContent(validUsername, "invalidPassword")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.token").doesNotExist());
    }

    @Test
    void login_withBlankUsername_returns400() throws Exception {
        mockMvc.perform(post(LOGIN_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(getLoginRequestContent("", validPassword)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void login_withBlankPassword_returns400() throws Exception {
        mockMvc.perform(post(LOGIN_ENDPOINT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(getLoginRequestContent(validUsername, "")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void refresh_withValidToken_returns200WithNewToken() throws Exception {
        when(jwtService.verifyTokenAndExtractClaims("valid.token"))
                .thenReturn(new JwtExtractedClaims("admin", List.of(Role.ADMIN)));
        when(jwtService.generateToken(any(), any())).thenReturn("new.token");

        mockMvc.perform(post(REFRESH_ENDPOINT)
                        .header("Authorization", "Bearer valid.token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("new.token"));
    }

    @Test
    void refresh_withExpiredToken_returns401() throws Exception {
        when(jwtService.verifyTokenAndExtractClaims("expired.token"))
                .thenThrow(new ExpiredJwtException(null, null, "Token expired"));

        mockMvc.perform(post(REFRESH_ENDPOINT)
                        .header("Authorization", "Bearer expired.token"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.token").doesNotExist());
    }

    @Test
    void refresh_withoutToken_returns401() throws Exception {
        mockMvc.perform(post(REFRESH_ENDPOINT))
                .andExpect(status().isUnauthorized());
    }

    private String getLoginRequestContent(String username, String password) {
        return """
                {"username": "%s", "password": "%s"}
                """.formatted(username, password);
    }
}
