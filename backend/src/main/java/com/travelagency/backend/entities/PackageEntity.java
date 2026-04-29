package com.travelagency.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.travelagency.backend.enums.PackageStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;


@Entity
@Table(name = "packages")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PackageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    @Column(nullable = false)
    private String packageName;
    @Column(nullable = false)
    private String destination;
    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false)
    private LocalDate startDate;
    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private double price;

    @Column(nullable = false)
    private Integer slots;


    @Column(nullable = false)
    private Integer availableSlots;

    @Column(length = 1000)
    private String includedServices;

    @Column(length = 1000)
    private String conditions;

    private String tripType;

    @Enumerated(EnumType.STRING)
    private PackageStatus packageStatus;


}


