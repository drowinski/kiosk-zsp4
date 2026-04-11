package dev.rowinski.kioskzsp4.asset;


import dev.rowinski.kioskzsp4.asset.filtering.AssetFilterStatus;
import dev.rowinski.kioskzsp4.asset.filtering.AssetFilterParams;
import dev.rowinski.kioskzsp4.asset.filtering.AssetFilterSpecificationBuilder;
import dev.rowinski.kioskzsp4.asset.model.Asset;
import dev.rowinski.kioskzsp4.asset.model.AssetDate;
import dev.rowinski.kioskzsp4.asset.model.AssetDatePrecision;
import dev.rowinski.kioskzsp4.asset.model.AssetType;
import org.jspecify.annotations.Nullable;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@EnableJpaAuditing
@ActiveProfiles("test")
public class AssetFilterSpecificationBuilderTest {
    @Autowired
    private TestEntityManager testEntityManager;

    @Autowired
    private AssetRepository assetRepository;

    @Test
    void dateFromAndDateTo__filterAssetsWithDateRanges() {
        // Filter date range
        LocalDate from = LocalDate.of(2022, 2, 1);
        LocalDate to = LocalDate.of(2024, 8, 12);

        // Asset date ranges - List.of(asset.date.min, asset.date.max)
        List<LocalDate> same = List.of(from, to); // [] = () - same range
        List<LocalDate> contained = List.of(from.plusDays(1), to.minusDays(1)); // [()] - filter contains value range
        List<LocalDate> contains = List.of(from.minusDays(1), to.plusDays(1));         // ([]) - value range contains filter
        List<LocalDate> endsInside = List.of(from.minusDays(1), from.plusDays(1));      // ([)] - end inside filter
        List<LocalDate> startsInside = List.of(to.minusDays(1), to.plusDays(1));        // [(]) - start inside filter
        List<LocalDate> outsideBefore = List.of(from.minusDays(2), from.minusDays(1));    // () [] - value range before filter
        List<LocalDate> outsideAfter = List.of(to.plusDays(1), to.plusDays(2));                 // [] () - value range after filter

        // Specific asset dates - List.of(asset.date.min, null)
        List<LocalDate> singleContained = Arrays.asList(from.plusDays(1), from.plusDays(1)); // [d] - filter contains specific date
        List<LocalDate> singleSameAsFrom = Arrays.asList(from, from);                               // d] - date same as filter start
        List<LocalDate> singleSameAsTo = Arrays.asList(to, to);                                   // [d - date same as filter end
        List<LocalDate> singleOutsideBefore = Arrays.asList(from.minusDays(1), from.minusDays(1)); // d [] - specific date before filter
        List<LocalDate> singleOutsideAfter = Arrays.asList(to.plusDays(1), to.plusDays(1));  // [] d - specific date after filter

        List<List<LocalDate>> dates = List.of(
                same, contained, contains, endsInside, startsInside, outsideBefore, outsideAfter,
                singleContained, singleSameAsFrom, singleSameAsTo, singleOutsideBefore, singleOutsideAfter
        );

        for (List<LocalDate> dateRange : dates) {
            Asset asset = createAsset();
            AssetDate assetDate = AssetDate.of(
                    dateRange.get(0),
                    dateRange.get(1),
                    AssetDatePrecision.DAY,
                    false
            );
            asset.setDate(assetDate);
            asset.setPublishedAt(Instant.now());
            testEntityManager.persist(asset);
        }

        Specification<Asset> closedRangeSpec = buildSpec(from, to);
        Specification<Asset> openLeftSpec = buildSpec(null, to);
        Specification<Asset> openRightSpec = buildSpec(from, null);

        List<Asset> closedRangeResult = assetRepository.findAll(closedRangeSpec);
        List<Asset> openLeftResult = assetRepository.findAll(openLeftSpec);
        List<Asset> openRightResult = assetRepository.findAll(openRightSpec);

        assertThat(extractDateRanges(closedRangeResult))
                .containsExactlyInAnyOrder(
                        same, contained, contains, endsInside, startsInside,
                        singleContained, singleSameAsFrom, singleSameAsTo
                );

        assertThat(extractDateRanges(openLeftResult))
                .containsExactlyInAnyOrder(
                        same, contained, contains, endsInside, startsInside, outsideBefore,
                        singleContained, singleSameAsFrom, singleSameAsTo, singleOutsideBefore
                );

        assertThat(extractDateRanges(openRightResult))
                .containsExactlyInAnyOrder(
                        same, contained, contains, endsInside, startsInside, outsideAfter,
                        singleContained, singleSameAsFrom, singleSameAsTo, singleOutsideAfter
                );
    }

    private List<List<@Nullable LocalDate>> extractDateRanges(List<Asset> assets) {
        return assets.stream()
                .map(Asset::getDate)
                .filter(Objects::nonNull)
                .map(date -> Arrays.asList(date.getMin(), date.getMax()))
                .toList();
    }

    private Specification<Asset> buildSpec(LocalDate from, LocalDate to) {
        return AssetFilterSpecificationBuilder.fromFilterParams(
                AssetFilterParams.builder()
                        .dateFrom(from)
                        .dateTo(to)
                        .build()
        );
    }

    @Test
    void defaultSpec__includesOnlyPublishedAssets() {
        StatusFilterTestAssets assets = persistStatusFilterTestAssets();

        Specification<Asset> spec = AssetFilterSpecificationBuilder.fromFilterParams(
                AssetFilterParams.builder().build()
        );
        List<Asset> result = assetRepository.findAll(spec);

        assertThat(result).contains(assets.published()).doesNotContain(assets.unpublished(), assets.deleted());
    }

    @Test
    void statusPublishedSpec__includesOnlyPublishedAssets() {
        StatusFilterTestAssets assets = persistStatusFilterTestAssets();

        Specification<Asset> spec = AssetFilterSpecificationBuilder.fromFilterParams(
                AssetFilterParams.builder().status(AssetFilterStatus.PUBLISHED).build()
        );
        List<Asset> result = assetRepository.findAll(spec);

        assertThat(result).contains(assets.published()).doesNotContain(assets.unpublished(), assets.deleted());
    }

    @Test
    void statusUnpublishedSpec__includesOnlyUnpublishedAssets() {
        StatusFilterTestAssets assets = persistStatusFilterTestAssets();

        Specification<Asset> spec = AssetFilterSpecificationBuilder.fromFilterParams(
                AssetFilterParams.builder().status(AssetFilterStatus.UNPUBLISHED).build()
        );
        List<Asset> result = assetRepository.findAll(spec);

        assertThat(result).contains(assets.unpublished()).doesNotContain(assets.published(), assets.deleted());
    }

    @Test
    void statusPublishedUnpublishedSpec__includesOnlyPublishedAndUnpublishedAssets() {
        StatusFilterTestAssets assets = persistStatusFilterTestAssets();

        Specification<Asset> spec = AssetFilterSpecificationBuilder.fromFilterParams(
                AssetFilterParams.builder().status(AssetFilterStatus.PUBLISHED_UNPUBLISHED).build()
        );
        List<Asset> result = assetRepository.findAll(spec);

        assertThat(result).contains(assets.published(), assets.unpublished()).doesNotContain(assets.deleted());
    }

    @Test
    void statusDeleted__includesOnlyDeletedAssets() {
        StatusFilterTestAssets assets = persistStatusFilterTestAssets();

        Specification<Asset> spec = AssetFilterSpecificationBuilder.fromFilterParams(
                AssetFilterParams.builder().status(AssetFilterStatus.DELETED).build()
        );
        List<Asset> result = assetRepository.findAll(spec);

        assertThat(result).contains(assets.deleted()).doesNotContain(assets.published(), assets.unpublished());
    }

    private record StatusFilterTestAssets(Asset published, Asset unpublished, Asset deleted) {
    }

    private StatusFilterTestAssets persistStatusFilterTestAssets() {
        Asset publishedAsset = createAsset();
        publishedAsset.setPublishedAt(Instant.now());
        publishedAsset.setDeletedAt(null);
        testEntityManager.persist(publishedAsset);

        Asset unpublishedAsset = createAsset();
        unpublishedAsset.setPublishedAt(null);
        unpublishedAsset.setDeletedAt(null);
        testEntityManager.persist(unpublishedAsset);

        Asset deletedAsset = createAsset();
        deletedAsset.setPublishedAt(null);
        deletedAsset.setDeletedAt(Instant.now());
        testEntityManager.persist(deletedAsset);

        return new StatusFilterTestAssets(publishedAsset, unpublishedAsset, deletedAsset);
    }

    private Asset createAsset() {
        Asset asset = new Asset();
        UUID assetId = UUID.randomUUID();
        asset.setId(assetId);
        asset.setFileName(assetId + ".jpg");
        asset.setOriginalFileName("test.jpg");
        asset.setMimeType("image/jpeg");
        asset.setType(AssetType.IMAGE);
        asset.setCreatedBy("MockUser");
        asset.setUpdatedBy("MockUser");
        return asset;
    }
}
