package com.travelagency.backend.repositories;

import com.travelagency.backend.entities.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {
    Optional<PaymentEntity> findByReservation_Id(Long reservationId);
    boolean existsByReservation_Id(Long reservationId);
}