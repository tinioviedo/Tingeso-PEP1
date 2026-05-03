package com.travelagency.backend.controllers;

import com.travelagency.backend.entities.DiscountEntity;
import com.travelagency.backend.services.DiscountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/discounts")
@CrossOrigin("*")
public class DiscountController {

    @Autowired
    DiscountService discountService;

    // POST /api/v1/discounts/
    @PostMapping("/")
    public ResponseEntity<DiscountEntity> createDiscount(@RequestBody DiscountEntity discount) {
        return ResponseEntity.status(HttpStatus.CREATED).body(discountService.createDiscount(discount));
    }

    // GET /api/v1/discounts/
    @GetMapping("/")
    public ResponseEntity<List<DiscountEntity>> getAllDiscounts() {
        return ResponseEntity.ok(discountService.getAllDiscounts());
    }

    // PUT /api/v1/discounts/{id}
    @PutMapping("/{id}")
    public ResponseEntity<DiscountEntity> updateDiscount(
            @PathVariable Long id,
            @RequestBody DiscountEntity updates) {
        return ResponseEntity.ok(discountService.updateDiscount(id, updates));
    }

    // PATCH /api/v1/discounts/{id}/status
    @PatchMapping("/{id}/status")
    public ResponseEntity<DiscountEntity> changeStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(discountService.changeStatus(id, body.get("active")));
    }
}