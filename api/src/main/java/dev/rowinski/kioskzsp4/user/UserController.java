package dev.rowinski.kioskzsp4.user;

import dev.rowinski.kioskzsp4.user.dto.UserResponseDTO;
import dev.rowinski.kioskzsp4.user.mapping.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserMapper userMapper;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getAuthenticatedUser(Authentication authentication) {
        return userService.findUserByUsername(authentication.getName())
                .map(userMapper::toUserResponseDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
