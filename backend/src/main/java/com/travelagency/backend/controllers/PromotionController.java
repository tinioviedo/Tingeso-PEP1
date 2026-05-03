package com.travelagency.backend.controllers;

import com.travelagency.backend.entities.PromotionEntity;
import com.travelagency.backend.services.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/promotions")
@CrossOrigin("*")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    @PostMapping("/")
    public ResponseEntity<PromotionEntity> createPromotion(@RequestBody PromotionEntity promotion) {
        return ResponseEntity.status(HttpStatus.CREATED).body(promotionService.createPromotion(promotion));
    }

    @GetMapping("/")
    public ResponseEntity<List<PromotionEntity>> getAllPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @GetMapping("/active")
    public ResponseEntity<List<PromotionEntity>> getActivePromotions() {
        return ResponseEntity.ok(promotionService.getActivePromotions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PromotionEntity> getPromotionById(@PathVariable Long id) {
        return ResponseEntity.ok(promotionService.getPromotionById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromotionEntity> updatePromotion(
            @PathVariable Long id,
            @RequestBody PromotionEntity updates) {
        return ResponseEntity.ok(promotionService.updatePromotion(id, updates));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PromotionEntity> changeStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(promotionService.changeStatus(id, body.get("active")));
    }
}