package dev.rowinski.kioskzsp4.asset.filtering;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class AssetFilterStatusConverter implements Converter<String, AssetFilterStatus> {
    @Override
    public AssetFilterStatus convert(String source) {
        return AssetFilterStatus.valueOf(source.toUpperCase());
    }
}
