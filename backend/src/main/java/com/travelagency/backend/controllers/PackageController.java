package com.travelagency.backend.controllers;

import com.travelagency.backend.entities.PackageEntity;
import com.travelagency.backend.enums.PackageStatus;
import com.travelagency.backend.services.PackageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/packages")
@CrossOrigin("*")
public class PackageController {

    @Autowired
    PackageService packageService;

    // POST /api/v1/packages/          → solo ADMIN
    // Crea un nuevo paquete turístico
    @PostMapping("/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PackageEntity> savePackage(@RequestBody PackageEntity pkg) {
        return ResponseEntity.status(HttpStatus.CREATED).body(packageService.savePackage(pkg));
    }

    // GET /api/v1/packages/
    // Retorna todos los paquetes sin filtro de estado
    @GetMapping("/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PackageEntity>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    // GET /api/v1/packages/{id}      admin y cliente
    // Retorna el detalle de un paquete específico
    @GetMapping("/{id}")
    public ResponseEntity<PackageEntity> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    // GET /api/v1/packages/available   publico
    // Épica 3: retorna paquetes disponibles con cupos y fechas válidas
    @GetMapping("/available")
    public ResponseEntity<List<PackageEntity>> getAvailablePackages() {
        return ResponseEntity.ok(packageService.getAvailablePackages());
    }

    // GET /api/v1/packages/search     publico
    // Épica 3: búsqueda con filtros opcionales
    // Ejemplo: /api/v1/packages/search?destination=Paris&minPrice=500&maxPrice=2000
    @GetMapping("/search")
    public ResponseEntity<List<PackageEntity>> searchPackages(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String tripType) {

        return ResponseEntity.ok(
                packageService.searchPackage(destination, minPrice, maxPrice, tripType));
    }

    // PUT /api/v1/packages/{id}       → solo ADMIN
    // Actualiza datos de un paquete existente
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PackageEntity> updatePackage(
            @PathVariable Long id,
            @RequestBody PackageEntity updates) {
        return ResponseEntity.ok(packageService.updatePackage(id, updates));
    }

    // PATCH /api/v1/packages/{id}/status  → solo ADMIN
    // Cambia SOLO el estado del paquete
    // Body JSON: { "packageStatus": "CANCELLED" }
    // PackageStatus.valueOf() convierte el String del JSON al Enum automáticamente
    // Si el string no existe en el Enum, Java lanza IllegalArgumentException solo
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PackageEntity> changeStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        PackageStatus newStatus = PackageStatus.valueOf(body.get("packageStatus"));
        return ResponseEntity.ok(packageService.changeStatus(id, newStatus));
    }
}