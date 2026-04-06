package dev.rowinski.kioskzsp4;

import dev.rowinski.kioskzsp4.asset.AssetProperties;
import dev.rowinski.kioskzsp4.auth.AuthProperties;
import dev.rowinski.kioskzsp4.user.UserProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({
        AuthProperties.class,
        UserProperties.class,
        AssetProperties.class
})
public class KioskZsp4Application {

    public static void main(String[] args) {
        SpringApplication.run(KioskZsp4Application.class, args);
    }

}
