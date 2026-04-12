package dev.rowinski.kioskzsp4.asset;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.nio.file.Path;

@ConfigurationProperties(prefix = "app.asset")
public record AssetProperties(Path rootDirectory, String baseMediaUri) {
    public Path rootDirectory() {
        return rootDirectory.normalize().toAbsolutePath();
    }

    public String baseMediaUri() {
        String stripped = this.baseMediaUri.stripTrailing();
        return stripped.endsWith("/") ? stripped : stripped + "/";
    }
}
