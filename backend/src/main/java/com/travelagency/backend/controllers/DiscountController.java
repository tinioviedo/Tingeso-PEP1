package com.travelagency.backend.controllers;

import com.travelagency.backend.entities.DiscountEntity;
import com.travelagency.backend.services.DiscountService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/discounts")
@CrossOrigin("*")
public class DiscountController {

    private final DiscountService discountService;

    public DiscountController(DiscountService discountService) {
        this.discountService = discountService;
    }

    @PostMapping("/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiscountEntity> createDiscount(@RequestBody DiscountEntity discount) {
        return ResponseEntity.status(HttpStatus.CREATED).body(discountService.createDiscount(discount));
    }

    @GetMapping("/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DiscountEntity>> getAllDiscounts() {
        return ResponseEntity.ok(discountService.getAllDiscounts());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiscountEntity> updateDiscount(
            @PathVariable Long id,
            @RequestBody DiscountEntity updates) {
        return ResponseEntity.ok(discountService.updateDiscount(id, updates));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiscountEntity> changeStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(discountService.changeStatus(id, body.get("active")));
    }
}