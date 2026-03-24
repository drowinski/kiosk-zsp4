package dev.rowinski.kioskzsp4.asset.filtering;

import dev.rowinski.kioskzsp4.asset.model.Asset;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import org.jspecify.annotations.Nullable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.ZoneOffset;

public class AssetFilterSpecificationBuilder {
    private AssetFilterSpecificationBuilder() {
    }

    public static Specification<Asset> fromFilterParams(AssetFilterParams params) {
        return Specification
                .where(notDeleted(params))
                .and(dateOn(params.dateOn()))
                .and(dateRange(params.dateFrom(), params.dateTo()))
                .and(description(params.description()))
                .and(createdAfter(params.createdAfter()))
                .and(createdBefore(params.createdBefore()))
                .and(updatedAfter(params.updatedAfter()))
                .and(updatedBefore(params.updatedBefore()))
                .and(deletedAfter(params.deletedAfter()))
                .and(deletedBefore(params.deletedBefore()));
    }

    private static Specification<Asset> notDeleted(AssetFilterParams params) {
        if (Boolean.TRUE.equals(params.deletedOnly())) {
            return (root, query, cb) -> cb.isNotNull(root.get("deletedAt"));
        }
        if (Boolean.TRUE.equals(params.includeDeleted())) {
            return Specification.unrestricted();
        }
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    private static Specification<Asset> dateOn(@Nullable LocalDate dateOn) {
        if (dateOn == null) return Specification.unrestricted();
        return (root, query, cb) -> cb.and(
                cb.lessThanOrEqualTo(root.get("date").get("min"), dateOn),
                cb.or(
                        cb.isNull(root.get("date").get("max")),
                        cb.greaterThanOrEqualTo(root.get("date").get("max"), dateOn)
                )
        );
    }

    private static Specification<Asset> dateRange(
            @Nullable LocalDate dateFrom,
            @Nullable LocalDate dateTo
    ) {
        if (dateFrom == null && dateTo == null) return Specification.unrestricted();

        return (root, query, cb) -> {
            Path<LocalDate> min = root.get("date").get("min");
            Path<LocalDate> max = root.get("date").get("max");

            Predicate isRange = cb.isNotNull(max);
            Predicate isSingleDate = cb.isNull(max);

            Predicate predicate = cb.conjunction();

            if (dateFrom != null) {
                predicate = cb.and(
                        predicate,
                        cb.or(
                                cb.and(isSingleDate, cb.greaterThanOrEqualTo(min, dateFrom)),
                                cb.and(isRange, cb.greaterThanOrEqualTo(max, dateFrom))
                        )
                );
            }

            if (dateTo != null) {
                predicate = cb.and(
                        predicate,
                        cb.lessThanOrEqualTo(min, dateTo)
                );
            }

            return predicate;
        };
    }

    private static Specification<Asset> description(@Nullable String description) {
        if (description == null) return Specification.unrestricted();
        return (root, query, cb) -> cb.like(cb.lower(root.get("description")), "%" + description.toLowerCase() + "%");
    }

    private static Specification<Asset> createdAfter(@Nullable LocalDate createdAfter) {
        return after("createdAt", createdAfter);
    }

    private static Specification<Asset> createdBefore(@Nullable LocalDate createdBefore) {
        return before("createdAt", createdBefore);
    }

    private static Specification<Asset> updatedAfter(@Nullable LocalDate updatedAfter) {
        return after("updatedAt", updatedAfter);
    }

    private static Specification<Asset> updatedBefore(@Nullable LocalDate updatedBefore) {
        return before("updatedAt", updatedBefore);
    }

    private static Specification<Asset> deletedAfter(@Nullable LocalDate deletedAfter) {
        return after("deletedAt", deletedAfter);
    }

    private static Specification<Asset> deletedBefore(@Nullable LocalDate deletedBefore) {
        return before("deletedAt", deletedBefore);
    }

    private static Specification<Asset> after(String rootKey, @Nullable LocalDate date) {
        if (date == null) return Specification.unrestricted();
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get(rootKey), date.atStartOfDay().toInstant(ZoneOffset.UTC));
    }

    private static Specification<Asset> before(String rootKey, @Nullable LocalDate date) {
        if (date == null) return Specification.unrestricted();
        return (root, query, cb) -> cb.lessThan(root.get(rootKey), date.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC));
    }
}
