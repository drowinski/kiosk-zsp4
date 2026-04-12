package dev.rowinski.kioskzsp4.asset;

import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.apache.tika.mime.MimeTypes;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class AssetConfig implements WebMvcConfigurer {
    private final AssetProperties assetProperties;

    @Bean
    public Tika tika() {
        return new Tika();
    }

    @Bean
    public MimeTypes mimeTypes() {
        return MimeTypes.getDefaultMimeTypes();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler(assetProperties.baseMediaUri() + "**")
                .addResourceLocations(assetProperties.rootDirectory().toAbsolutePath().toUri().toString());
    }
}
