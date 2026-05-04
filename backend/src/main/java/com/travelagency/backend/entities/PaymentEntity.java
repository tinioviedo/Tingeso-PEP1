package com.travelagency.backend.entities;

import com.travelagency.backend.enums.PaymentMethod;
import com.travelagency.backend.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    @OneToOne
    @JoinColumn(name = "reservation_id", nullable = false, unique = true)
    private ReservationEntity reservation;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;

    @Column(nullable = false)
    private String cardNumber;

    @Column(nullable = false)
    private String cardExpiration;

    @Column(nullable = false)
    private String cvv;

    @Column(nullable = false, updatable = false)
    private LocalDateTime paymentDate;

    @PrePersist
    protected void onCreate() {
        this.paymentDate = LocalDateTime.now();
    }
}