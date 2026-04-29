package com.travelagency.backend.repositories;

import com.travelagency.backend.entities.PackageEntity;
import com.travelagency.backend.enums.PackageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.time.LocalDate;
import java.util.List;

public interface PackageRepository extends JpaRepository<PackageEntity, Long> {
    //obtener todos los paquetes por su estado, Usado por el admin para ver todos los paquetes según su estado
    List<PackageEntity> findByPackageStatus(PackageStatus packageStatus);

    //esto es de la epica 3 paquetes disponibles para clientes
    //filtrar STATUS = AVAILABLE y que cupos >0, y que fecha inicio >= hoy
    // epica 3: paquetes disponibles para clientes
    //filtra: status=AVAILABLE, cupos > 0, fecha inicio >= hoy
    @Query("SELECT p FROM PackageEntity p WHERE p.packageStatus = :status " +
            "AND p.availableSlots > 0 " +
            "AND p.startDate >= :today")
    List<PackageEntity> findAvailablePackages(
            @Param("status") PackageStatus status,
            @Param("today") LocalDate today);

    // epica 3: búsqueda con filtros opcionales combinados
    //todos los parámetros son opcionales — si vienen null, no filtran
    @Query("SELECT p FROM PackageEntity p WHERE p.packageStatus = :status " +
            "AND p.availableSlots > 0 " +
            "AND p.startDate >= :today " +
            "AND (:destination IS NULL OR LOWER(p.destination) LIKE LOWER(CONCAT('%', :destination, '%'))) " +
            "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
            "AND (:tripType IS NULL OR p.tripType = :tripType)")
    List<PackageEntity> searchPackages(
            @Param("status") PackageStatus status,
            @Param("destination") String destination,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("tripType") String tripType,
            @Param("today") LocalDate today);
}


