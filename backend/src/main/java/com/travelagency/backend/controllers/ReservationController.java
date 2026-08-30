package com.travelagency.backend.controllers;

import com.travelagency.backend.entities.ReservationEntity;
import com.travelagency.backend.services.DiscountService;
import com.travelagency.backend.services.ReservationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reservations")
@CrossOrigin("*")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping("/")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ReservationEntity> createReservation(@RequestBody Map<String, Object> body) {
        Long clientId = Long.valueOf(body.get("clientId").toString());
        Long packageId = Long.valueOf(body.get("packageId").toString());
        Integer quantity = Integer.valueOf(body.get("quantity").toString());
        Object companionsRaw = body.get("companions");
        String companions = companionsRaw != null ? companionsRaw.toString() : null;
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationService.createReservation(clientId, packageId, quantity, companions));
    }

    // Cotización real (con descuentos aplicables) sin crear ninguna reserva.
    @GetMapping("/quote")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<DiscountService.DiscountResult> quoteReservation(
            @RequestParam Long clientId,
            @RequestParam Long packageId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(reservationService.quoteReservation(clientId, packageId, quantity));
    }

    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ReservationEntity> cancelReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.cancelReservation(id));
    }

    @GetMapping("/my/{clientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<ReservationEntity>> getMyReservations(@PathVariable Long clientId) {
        return ResponseEntity.ok(reservationService.getMyReservations(clientId));
    }

    @GetMapping("/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReservationEntity>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ReservationEntity> getReservationById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }

    @PostMapping("/multiple")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<List<ReservationEntity>> createMultipleReservations(@RequestBody Map<String, Object> body) {
        Long clientId = Long.valueOf(body.get("clientId").toString());
        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationService.createMultipleReservations(clientId, items));
    }
}