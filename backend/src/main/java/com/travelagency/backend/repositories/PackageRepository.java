package com.travelagency.backend.repositories;

import com.travelagency.backend.entities.PackageEntity;
import com.travelagency.backend.enums.PackageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.time.LocalDate;
import java.util.List;

public interface PackageRepository extends JpaRepository<PackageEntity, Long> {
    List<PackageEntity> findByPackageStatus(PackageStatus packageStatus);
    //filtra status=AVAILABLE, cupos > 0, fecha inicio >= hoy
    @Query("SELECT p FROM PackageEntity p WHERE p.packageStatus = :status " +
            "AND p.availableSlots > 0 " +
            "AND p.startDate >= :today")
    List<PackageEntity> findAvailablePackages(
            @Param("status") PackageStatus status,
            @Param("today") LocalDate today);

    // searchPackages ya no se usa — el filtrado se hace en PackageService con streams
    // para evitar el bug de JPQL con (:numericParam IS NULL OR ...) en PostgreSQL.
}


