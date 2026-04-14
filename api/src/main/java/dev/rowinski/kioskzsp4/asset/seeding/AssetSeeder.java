package dev.rowinski.kioskzsp4.asset.seeding;

import dev.rowinski.kioskzsp4.asset.AssetRepository;
import dev.rowinski.kioskzsp4.asset.AssetService;
import dev.rowinski.kioskzsp4.asset.model.Asset;
import dev.rowinski.kioskzsp4.asset.model.AssetDate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;


@Slf4j
@Order(2)
@Component
@Profile("dev")
@RequiredArgsConstructor
public class AssetSeeder implements ApplicationRunner {
    private final JsonMapper jsonMapper;
    private final AssetService assetService;
    private final AssetRepository assetRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            UserDetails userDetails = User.withUsername("system:asset_seeder").password("").roles("ADMIN").build();
            Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            SecurityContextHolder.setContext(
                    SecurityContextHolder.createEmptyContext()
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource jsonResource = resolver.getResource("classpath:/asset/seed/index.json");
            Resource imageResource = resolver.getResource("classpath:/asset/seed/image.jpg");
            AssetSeedDTO[] seedAssets = jsonMapper.readValue(jsonResource.getInputStream(), AssetSeedDTO[].class);
            for (AssetSeedDTO seedAsset : seedAssets) {
                Asset asset = assetService.storeAsset(
                        imageResource.getInputStream(),
                        seedAsset.originalFileName(),
                        seedAsset.description(),
                        AssetDate.of(seedAsset.date().min(),
                                seedAsset.date().max(),
                                seedAsset.date().precision(),
                                seedAsset.date().approximate())
                );

                asset.setNew(false);
                asset.setPublishedAt(seedAsset.publishedAt());
                asset.setPublishedBy(seedAsset.publishedBy());
                asset.setDeletedAt(seedAsset.deletedAt());
                asset.setDeletedBy(seedAsset.deletedBy());
                assetRepository.save(asset);
            }
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
