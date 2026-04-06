package dev.rowinski.kioskzsp4.asset.exceptions;

import java.util.UUID;

public class AssetNotFoundException extends RuntimeException {
    public AssetNotFoundException(UUID assetId) {
        super("Asset with id " + assetId + " not found");
    }

    public AssetNotFoundException(UUID assetId, Throwable cause) {
        super("Asset with id " + assetId + " not found", cause);
    }
}
