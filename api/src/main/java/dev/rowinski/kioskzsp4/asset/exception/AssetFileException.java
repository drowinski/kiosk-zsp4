package dev.rowinski.kioskzsp4.asset.exception;

public class AssetFileException extends RuntimeException {
    public AssetFileException(String message) {
        super(message);
    }

    public AssetFileException(Throwable cause) {
        super(cause);
    }

    public AssetFileException(String message, Throwable cause) {
        super(message, cause);
    }
}
