package dev.rowinski.kioskzsp4.auth;

import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Profile("test")
@RequestMapping("/test")
public class JwtFilterTestController {
    @GetMapping("/protected")
    public String protectedMethod() {
        return "protected";
    }
}
