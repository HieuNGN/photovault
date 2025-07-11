package com.internship.photovault.config;

import org.springframework.stereotype.Component;
import java.util.Set;

@Component
public class FileValidationConfig {
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp"
    );

    public boolean isValidImageType(String contentType) {
        return ALLOWED_TYPES.contains(contentType);
    }
}
