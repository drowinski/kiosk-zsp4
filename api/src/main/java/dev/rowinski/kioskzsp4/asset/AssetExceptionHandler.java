package dev.rowinski.kioskzsp4.asset;

import dev.rowinski.kioskzsp4.asset.exceptions.AssetFileException;
import dev.rowinski.kioskzsp4.asset.exceptions.AssetNotFoundException;
import dev.rowinski.kioskzsp4.asset.exceptions.AssetOperationNotAllowed;
import dev.rowinski.kioskzsp4.asset.exceptions.AssetTypeNotSupportedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class AssetExceptionHandler {
    @ExceptionHandler(AssetFileException.class)
    public ResponseEntity<Void> handleAssetFile(AssetFileException e) {
        log.error(e.getMessage(), e);
        return ResponseEntity.internalServerError().build();
    }

    @ExceptionHandler(AssetNotFoundException.class)
    public ResponseEntity<Void> handleAssetNotFound(AssetNotFoundException e) {
        log.debug(e.getMessage(), e);
        return ResponseEntity.notFound().build();
    }

    @ExceptionHandler(AssetOperationNotAllowed.class)
    public ResponseEntity<Void> handleAssetOperationNotAllowed(AssetOperationNotAllowed e) {
        log.debug(e.getMessage(), e);
        return ResponseEntity.badRequest().build();
    }

    @ExceptionHandler(AssetTypeNotSupportedException.class)
    public ResponseEntity<Void> handleUnsupportedFileType(AssetTypeNotSupportedException e) {
        log.debug(e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).build();
    }
}
