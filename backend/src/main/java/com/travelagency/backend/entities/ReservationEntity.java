package com.travelagency.backend.entities;

import com.travelagency.backend.enums.ReservationStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ReservationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private ClientEntity client;

    @ManyToOne
    @JoinColumn(name = "package_id", nullable = false)
    private PackageEntity travelPackage;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, updatable = false)
    private LocalDateTime reservationDate;

    @Column(nullable = false)
    private Double baseAmount; //Precio multiplicado por la cantidad de descuento

    @Column(nullable = false)
    private Double discountAmount;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(length = 500)
    private String appliedDiscounts; //String que documenta el descuento

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus reservationStatus;

    @PrePersist
    protected void onCreate() {
        this.reservationDate = LocalDateTime.now();
    }
}