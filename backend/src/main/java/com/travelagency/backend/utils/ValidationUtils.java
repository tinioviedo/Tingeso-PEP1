package com.travelagency.backend.utils;

public final class ValidationUtils {

    // Clase utilitaria: sólo expone métodos estáticos, no debe instanciarse.
    private ValidationUtils() {
    }

    public static void validateField(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("El " + fieldName + " es obligatorio.");
        }
    }
}