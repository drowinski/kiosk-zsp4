package dev.rowinski.kioskzsp4.auth;

import dev.rowinski.kioskzsp4.user.Role;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public record LoginRequest(
            @NotBlank(message = "Username must not be blank") String username,
            @NotBlank(message = "Password must not be blank") String password
    ) {
    }

    public record TokenResponse(String token) {
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest body) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(body.username(), body.password())
            );
            if (!(authentication.getPrincipal() instanceof UserDetails userDetails)) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
            }
            String token = jwtService.generateToken(
                    userDetails.getUsername(), getRolesFromAuthorities(userDetails.getAuthorities())
            );
            return ResponseEntity.ok(new TokenResponse(token));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(Authentication authentication) {
        if (!(authentication.getPrincipal() instanceof UserDetails userDetails)) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        String token = jwtService.generateToken(
                userDetails.getUsername(), getRolesFromAuthorities(userDetails.getAuthorities())
        );
        return ResponseEntity.ok(new TokenResponse(token));
    }

    private List<Role> getRolesFromAuthorities(Collection<? extends GrantedAuthority> authorities) {
        return authorities.stream().filter(Role::isRole).map(Role::fromAuthority).toList();
    }
}
