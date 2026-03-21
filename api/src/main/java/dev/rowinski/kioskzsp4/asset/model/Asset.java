package dev.rowinski.kioskzsp4.asset.model;

import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.jspecify.annotations.Nullable;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.domain.Persistable;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@Table(name = "assets", check = {
        @CheckConstraint(constraint = "date_min IS NULL OR (date_min IS NOT NULL AND date_precision IS NOT NULL)")
})
public class Asset implements Persistable<UUID> {
    @Id
    @NotNull
    private UUID id;

    @Column(columnDefinition = "TEXT")
    @NotNull
    private String fileName;

    @Column(columnDefinition = "TEXT")
    @Nullable
    private String originalFileName;

    @Column(columnDefinition = "TEXT")
    @NotNull
    private String mimeType;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "TEXT")
    @NotNull
    private AssetType type;

    @Column(columnDefinition = "TEXT")
    @Nullable
    private String description;

    @Valid
    @Embedded
    @Nullable
    private AssetDate date;

    @CreatedDate
    @Column(updatable = false)
    @NotNull
    private Instant createdAt;

    @LastModifiedDate
    @NotNull
    private Instant updatedAt;

    @CreatedBy
    @Column(updatable = false)
    @NotNull
    private String createdBy;

    @LastModifiedBy
    @NotNull
    private String updatedBy;

    @Transient
    private boolean isNew = true;

    @PrePersist
    private void ensureIdNotNull() {
        //noinspection ConstantValue
        if (id == null) {
            id = UUID.randomUUID();
        }
    }

    @PostLoad
    private void markNotNew() {
        this.isNew = false;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }
}
