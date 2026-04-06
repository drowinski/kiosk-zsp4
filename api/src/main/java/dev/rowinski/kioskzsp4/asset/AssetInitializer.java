package dev.rowinski.kioskzsp4.asset;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Stream;

@Slf4j
@Component
@RequiredArgsConstructor
public class AssetInitializer implements ApplicationRunner {
    private final AssetProperties assetProperties;

    private final Environment environment;

    @Value("${spring.jpa.hibernate.ddl-auto}")
    private String ddlAuto;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        createMediaRootDirectory();
        clearMediaRootDirectory();
    }

    private void createMediaRootDirectory() {
        if (Files.isDirectory(assetProperties.rootDirectory())) {
            log.info("Asset directory is located at {}", assetProperties.rootDirectory());
            return;
        }
        try {
            log.info("Creating asset directory at {}", assetProperties.rootDirectory());
            Files.createDirectories(assetProperties.rootDirectory());
            log.info("Asset directory created successfully");
        } catch (IOException e) {
            log.error("Unable to create asset root directory at {}", assetProperties.rootDirectory(), e);
        }
    }

    private void clearMediaRootDirectory() {
        if (!environment.acceptsProfiles(Profiles.of("dev"))
                || !ddlAuto.trim().equalsIgnoreCase("create-drop")
        ) {
            return;
        }
        if (!Files.isDirectory(assetProperties.rootDirectory())) {
            return;
        }

        log.info("Clearing asset directory because active profiles include 'dev' and 'spring.jpa.hibernate.ddl-auto' is set to 'create-drop'...");
        try (Stream<Path> stream = Files.list(assetProperties.rootDirectory())) {
            stream.forEach(path -> {
                try {
                    Files.delete(path);
                } catch (IOException e) {
                    log.warn("Unable to delete file {}", path, e);
                }
            });
        } catch (IOException e) {
            log.error("Unable to list asset directory for clearing", e);
        }
    }
}
