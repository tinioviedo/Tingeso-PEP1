package com.travelagency.backend.controllers;

import com.travelagency.backend.entities.PaymentEntity;
import com.travelagency.backend.services.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@CrossOrigin("*")
public class PaymentController {

    @Autowired
    PaymentService paymentService;

    // POST /api/v1/payments/
    // Body: { "reservationId": 1, "cardNumber": "1234567890123456", "cardExpiration": "12/28", "dvv": "123" }
    @PostMapping("/")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<PaymentEntity> processPayment(@RequestBody Map<String, Object> body) {
        Long reservationId = Long.valueOf(body.get("reservationId").toString());
        String cardNumber = body.get("cardNumber").toString();
        String cardExpiration = body.get("cardExpiration").toString();
        String cardCvv = body.get("cvv").toString();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.processPayment(reservationId, cardNumber, cardExpiration, cardCvv));
    }

    // GET /api/v1/payments/reservation/{reservationId}
    @GetMapping("/reservation/{reservationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<PaymentEntity> getPaymentByReservation(@PathVariable Long reservationId) {
        return ResponseEntity.ok(paymentService.getPaymentByReservationId(reservationId));
    }

    // GET /api/v1/payments/
    @GetMapping("/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentEntity>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
}