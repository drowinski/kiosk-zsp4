package dev.rowinski.kioskzsp4.asset.exception;

public class AssetOperationNotAllowed extends RuntimeException {
    public AssetOperationNotAllowed(String message) {
        super(message);
    }
}
