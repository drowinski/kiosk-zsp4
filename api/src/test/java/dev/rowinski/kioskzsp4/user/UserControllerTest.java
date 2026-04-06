package dev.rowinski.kioskzsp4.user;

import dev.rowinski.kioskzsp4.TestWithSecurity;
import dev.rowinski.kioskzsp4.user.dto.UserResponseDTO;
import dev.rowinski.kioskzsp4.user.mapping.UserMapper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = UserController.class, includeFilters = {
        @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, value = UserMapper.class)
})
@ActiveProfiles("test")
public class UserControllerTest extends TestWithSecurity {
    private final static String AUTHENTICATED_USER_ENDPOINT = "/api/users/me";

    @MockitoBean
    private UserService userService;

    @Test
    @WithMockUser(username = "MockUser")
    void getAuthenticatedUser_withAuthenticatedUser_returnsUserData() throws Exception {
        User mockUser = new User();
        mockUser.setId(21L);
        mockUser.setUsername("MockUser");
        mockUser.setRole(Role.ADMIN);

        when(userService.findUserByUsername(eq(mockUser.getUsername()))).thenReturn(Optional.of(mockUser));

        mockMvc.perform(get(AUTHENTICATED_USER_ENDPOINT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(mockUser.getId()));
    }

    @Test
    void getAuthenticatedUser_withoutAuthenticatedUser_returns401() throws Exception {
        mockMvc.perform(get(AUTHENTICATED_USER_ENDPOINT))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(userService);
    }
}
