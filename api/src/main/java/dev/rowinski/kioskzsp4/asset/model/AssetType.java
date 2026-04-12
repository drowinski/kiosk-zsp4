package dev.rowinski.kioskzsp4.asset.model;

import com.fasterxml.jackson.annotation.JsonValue;
import dev.rowinski.kioskzsp4.asset.AssetMimeTypes;
import dev.rowinski.kioskzsp4.asset.exceptions.AssetTypeNotSupportedException;

public enum AssetType {
    IMAGE,
    VIDEO,
    AUDIO,
    DOCUMENT;

    public static AssetType fromMimeType(String mimeType) {
        if (!AssetMimeTypes.isSupported(mimeType)) {
            throw new AssetTypeNotSupportedException("Unsupported mime type: " + mimeType);
        }

        if (mimeType.startsWith("image/")) {
            return IMAGE;
        } else if (mimeType.startsWith("video/")) {
            return VIDEO;
        } else if (mimeType.startsWith("audio/")) {
            return AUDIO;
        } else if (mimeType.equals("application/pdf")) {
            return DOCUMENT;
        } else {
            throw new AssetTypeNotSupportedException("AssetType cannot be inferred from mime type: " + mimeType);
        }
    }

    @JsonValue
    public String toLowerCase() {
        return this.name().toLowerCase();
    }
}
