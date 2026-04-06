package dev.rowinski.kioskzsp4.asset.exceptions;

public class UnsupportedFileTypeException extends RuntimeException {
    public UnsupportedFileTypeException(String message) {
        super(message);
    }

    public UnsupportedFileTypeException(Throwable cause) {
        super(cause);
    }

    public UnsupportedFileTypeException(String message, Throwable cause) {
        super(message, cause);
    }
}
