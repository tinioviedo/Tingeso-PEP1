package com.travelagency.backend.repositories;

import com.travelagency.backend.entities.DiscountEntity;
import com.travelagency.backend.enums.DiscountType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DiscountRepository extends JpaRepository<DiscountEntity, Long> {
    Optional<DiscountEntity> findByDiscountTypeAndActiveTrue(DiscountType discountType);
}