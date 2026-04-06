package dev.rowinski.kioskzsp4;

import dev.rowinski.kioskzsp4.auth.JwtFilter;
import dev.rowinski.kioskzsp4.auth.JwtService;
import dev.rowinski.kioskzsp4.auth.AuthConfig;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

@Import({AuthConfig.class, JwtFilter.class})
public abstract class TestWithSecurity {
    @Autowired
    protected WebApplicationContext webApplicationContext;

    @MockitoBean
    protected JwtService jwtService;

    protected MockMvc mockMvc;

    @BeforeEach
    protected final void setUpSpringSecurityTest() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }
}
