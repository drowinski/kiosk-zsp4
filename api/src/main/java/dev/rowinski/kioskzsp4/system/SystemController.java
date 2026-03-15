package dev.rowinski.kioskzsp4.system;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class SystemController {
    @GetMapping
    public ResponseEntity<Void> health() {
        return ResponseEntity.ok().build();
    }
}
