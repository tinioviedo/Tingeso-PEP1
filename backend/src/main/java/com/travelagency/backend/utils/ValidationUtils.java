package com.travelagency.backend.utils;

public class ValidationUtils {

    public static void validateField(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("El " + fieldName + " es obligatorio.");
        }
    }
}