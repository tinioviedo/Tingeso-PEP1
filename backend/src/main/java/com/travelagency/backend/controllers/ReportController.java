package com.travelagency.backend.controllers;

import com.travelagency.backend.entities.ReservationEntity;
import com.travelagency.backend.services.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
@CrossOrigin("*")
public class ReportController {

    @Autowired
    ReportService reportService;

    // GET /api/v1/reports/sales?startDate=2026-01-01&endDate=2026-12-31
    @GetMapping("/sales")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReservationEntity>> getSalesByPeriod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getSalesByPeriod(startDate, endDate));
    }

    // GET /api/v1/reports/ranking?startDate=2026-01-01&endDate=2026-12-31
    @GetMapping("/ranking")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getPackageRankingByPeriod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(reportService.getPackageRankingByPeriod(startDate, endDate));
    }
}