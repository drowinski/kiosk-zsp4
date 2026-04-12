package dev.rowinski.kioskzsp4.asset.model;

import com.fasterxml.jackson.annotation.JsonValue;

public enum AssetDatePrecision {
    DAY,
    MONTH,
    YEAR,
    DECADE,
    CENTURY;

    @JsonValue
    public String toLowerCase() {
        return this.name().toLowerCase();
    }
}
