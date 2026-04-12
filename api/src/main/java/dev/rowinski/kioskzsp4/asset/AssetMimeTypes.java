package dev.rowinski.kioskzsp4.asset;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.jspecify.annotations.Nullable;

import java.util.Set;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class AssetMimeTypes {
    public static final Set<String> SUPPORTED = Set.of(
            "image/jpeg",
            "image/png",
            "video/mp4",
            "application/pdf"
    );

    public static boolean isSupported(@Nullable String mimeType) {
        return SUPPORTED.contains(mimeType);
    }
}
