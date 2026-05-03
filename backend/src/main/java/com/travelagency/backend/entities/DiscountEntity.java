package com.travelagency.backend.entities;

import com.travelagency.backend.enums.DiscountType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "discounts")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DiscountEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private DiscountType discountType;

    @Column(nullable = false)
    private Double minThreshold;

    @Column(nullable = false)
    private Double discountRate;

    @Column(nullable = false)
    private Boolean active = true;
}