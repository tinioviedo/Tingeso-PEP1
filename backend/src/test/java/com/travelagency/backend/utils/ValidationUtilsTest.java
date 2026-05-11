package com.travelagency.backend.utils;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class ValidationUtilsTest {

    // ── validateField ─────────────────────────────────────────────────────────

    @Test
    void validateField_validValue_doesNotThrow() {
        // Given
        String value = "Martin";
        String fieldName = "nombre completo";

        // When / Then
        assertThatCode(() -> ValidationUtils.validateField(value, fieldName))
                .doesNotThrowAnyException();
    }

    @Test
    void validateField_nullValue_throwsIllegalArgument() {
        // Given
        String value = null;
        String fieldName = "email";

        // When / Then
        assertThatThrownBy(() -> ValidationUtils.validateField(value, fieldName))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("email");
    }

    @Test
    void validateField_blankValue_throwsIllegalArgument() {
        // Given
        String value = "   ";
        String fieldName = "destino";

        // When / Then
        assertThatThrownBy(() -> ValidationUtils.validateField(value, fieldName))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("destino");
    }

    @Test
    void validateField_emptyString_throwsIllegalArgument() {
        // Given
        String value = "";
        String fieldName = "descripción";

        // When / Then
        assertThatThrownBy(() -> ValidationUtils.validateField(value, fieldName))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("descripción");
    }

    @Test
    void validateField_valueWithSpaces_doesNotThrow() {
        // Given — valor válido aunque tenga espacios internos
        String value = "Viaje a Paris";
        String fieldName = "nombre del paquete";

        // When / Then
        assertThatCode(() -> ValidationUtils.validateField(value, fieldName))
                .doesNotThrowAnyException();
    }
}
