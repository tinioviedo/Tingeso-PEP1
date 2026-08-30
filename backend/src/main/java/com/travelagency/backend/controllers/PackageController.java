package com.travelagency.backend.controllers;

import com.travelagency.backend.entities.PackageEntity;
import com.travelagency.backend.enums.PackageStatus;
import com.travelagency.backend.services.PackageService;
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

    private final PackageService packageService;

    public PackageController(PackageService packageService) {
        this.packageService = packageService;
    }

    // Crea un nuevo paquete turístico
    // ADMIN
    @PostMapping("/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PackageEntity> savePackage(@RequestBody PackageEntity pkg) {
        return ResponseEntity.status(HttpStatus.CREATED).body(packageService.savePackage(pkg));
    }

    // Retorna todos los paquetes sin filtro de estado
    // ADMIN
    @GetMapping("/")
    @PreAuthorize("hasRole('ADMIN')") 
    public ResponseEntity<List<PackageEntity>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }
    // Retorna el detalle de un paquete específico
    // AUTENTICADO
    @GetMapping("/{id}")
    public ResponseEntity<PackageEntity> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    // Épica 3: retorna paquetes disponibles con cupos y fechas válidas
    // PÚBLICO
    @GetMapping("/available")
    public ResponseEntity<List<PackageEntity>> getAvailablePackages() {
        return ResponseEntity.ok(packageService.getAvailablePackages());
    }

    // Épica 3: búsqueda con filtros opcionales
    // PÚBLICO

    @GetMapping("/search")
    public ResponseEntity<List<PackageEntity>> searchPackages(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String tripType) {

        return ResponseEntity.ok(
                packageService.searchPackage(destination, minPrice, maxPrice, tripType));
    }

    // Actualiza datos de un paquete existente
    // ADMIN
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PackageEntity> updatePackage(
            @PathVariable Long id,
            @RequestBody PackageEntity updates) {
        return ResponseEntity.ok(packageService.updatePackage(id, updates));
    }

    // Cambia SOLO el estado del paquete
    // ADMIN
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PackageEntity> changeStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        PackageStatus newStatus = PackageStatus.valueOf(body.get("packageStatus"));
        return ResponseEntity.ok(packageService.changeStatus(id, newStatus));
    }
}