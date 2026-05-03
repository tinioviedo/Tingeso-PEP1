package com.travelagency.backend.repositories;

import com.travelagency.backend.entities.PromotionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PromotionRepository extends JpaRepository<PromotionEntity, Long> {

    @Query("SELECT p FROM PromotionEntity p WHERE p.active = true " +
            "AND :today BETWEEN p.startDate AND p.endDate")
    List<PromotionEntity> findActivePromotions(@Param("today") LocalDate today);
}