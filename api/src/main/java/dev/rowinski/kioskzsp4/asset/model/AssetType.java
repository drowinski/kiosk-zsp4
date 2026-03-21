package dev.rowinski.kioskzsp4.asset.model;

import dev.rowinski.kioskzsp4.asset.exception.UnsupportedFileTypeException;

public enum AssetType {
    IMAGE,
    VIDEO,
    AUDIO,
    DOCUMENT;

    public static AssetType fromMimeType(String mimeType) {
        if (mimeType.startsWith("image/")) {
            return IMAGE;
        } else if (mimeType.startsWith("video/")) {
            return VIDEO;
        } else if (mimeType.startsWith("audio/")) {
            return AUDIO;
        } else if (mimeType.equals("application/pdf")) {
            return DOCUMENT;
        } else {
            throw new UnsupportedFileTypeException("Unknown mime type: " + mimeType);
        }
    }
}
