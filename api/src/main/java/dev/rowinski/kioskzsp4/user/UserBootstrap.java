package dev.rowinski.kioskzsp4.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserBootstrap implements ApplicationRunner {
    private final UserService userService;
    private final UserRepository userRepository;
    private final UserProperties userProperties;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.count() == 0) {
            log.info("User repository empty. Creating default admin user...");
            userService.createUser(
                    userProperties.defaultUser().username(),
                    userProperties.defaultUser().password(),
                    Role.ADMIN
            );
        }
    }
}
