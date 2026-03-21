package dev.rowinski.kioskzsp4.asset;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.nio.file.Path;

@ConfigurationProperties(prefix = "app.asset")
public record AssetProperties(Path rootDirectory) {
    public Path rootDirectory() {
        return rootDirectory.normalize().toAbsolutePath();
    }
}
