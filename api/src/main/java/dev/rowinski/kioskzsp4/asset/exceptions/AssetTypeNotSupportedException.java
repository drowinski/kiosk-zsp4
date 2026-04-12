package dev.rowinski.kioskzsp4.asset.exceptions;

public class AssetTypeNotSupportedException extends RuntimeException {
    public AssetTypeNotSupportedException(String message) {
        super(message);
    }

    public AssetTypeNotSupportedException(Throwable cause) {
        super(cause);
    }

    public AssetTypeNotSupportedException(String message, Throwable cause) {
        super(message, cause);
    }
}
