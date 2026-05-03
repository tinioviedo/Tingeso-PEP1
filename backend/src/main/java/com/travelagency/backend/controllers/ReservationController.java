package com.travelagency.backend.controllers;

import com.travelagency.backend.entities.ReservationEntity;
import com.travelagency.backend.services.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reservations")
@CrossOrigin("*")
public class ReservationController {

    @Autowired
    ReservationService reservationService;

    // POST /api/v1/reservations/
    // Body: { "clientId": 1, "packageId": 2, "quantity": 3 }
    @PostMapping("/")
    public ResponseEntity<ReservationEntity> createReservation(@RequestBody Map<String, Object> body) {
        Long clientId = Long.valueOf(body.get("clientId").toString());
        Long packageId = Long.valueOf(body.get("packageId").toString());
        Integer quantity = Integer.valueOf(body.get("quantity").toString());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationService.createReservation(clientId, packageId, quantity));
    }

    // PATCH /api/v1/reservations/{id}/cancel
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ReservationEntity> cancelReservation(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.cancelReservation(id));
    }

    // GET /api/v1/reservations/my/{clientId}
    @GetMapping("/my/{clientId}")
    public ResponseEntity<List<ReservationEntity>> getMyReservations(@PathVariable Long clientId) {
        return ResponseEntity.ok(reservationService.getMyReservations(clientId));
    }

    // GET /api/v1/reservations/          → admin
    @GetMapping("/")
    public ResponseEntity<List<ReservationEntity>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    // GET /api/v1/reservations/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ReservationEntity> getReservationById(@PathVariable Long id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }

    // POST /api/v1/reservations/multiple
// Body: { "clientId": 1, "items": [{"packageId": 1, "quantity": 2}, {"packageId": 2, "quantity": 3}] }
    @PostMapping("/multiple")
    public ResponseEntity<List<ReservationEntity>> createMultipleReservations(@RequestBody Map<String, Object> body) {
        Long clientId = Long.valueOf(body.get("clientId").toString());
        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationService.createMultipleReservations(clientId, items));
    }
}