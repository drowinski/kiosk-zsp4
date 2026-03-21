package dev.rowinski.kioskzsp4.asset;

import org.apache.tika.Tika;
import org.apache.tika.mime.MimeTypes;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AssetConfig {
    @Bean
    public Tika tika() {
        return new Tika();
    }

    @Bean
    public MimeTypes mimeTypes() {
        return MimeTypes.getDefaultMimeTypes();
    }
}
