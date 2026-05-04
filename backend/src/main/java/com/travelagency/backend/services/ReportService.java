package com.travelagency.backend.services;

import com.travelagency.backend.entities.ReservationEntity;
import com.travelagency.backend.repositories.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private ReservationRepository reservationRepository;

    // Reporte 1 — ventas por período
    // startDate no puede ser posterior a endDate
    public List<ReservationEntity> getSalesByPeriod(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        return reservationRepository.findSalesByPeriod(start, end);
    }

    // Reporte 2 — ranking de paquetes por período
    // ordenado por la cantidad de reservas en orden DESC, luego nombre en orden ASC en caso de empate
    public List<Map<String, Object>> getPackageRankingByPeriod(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date.");
        }
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);

        List<Object[]> results = reservationRepository.findPackageRankingByPeriod(start, end);

        return results.stream().map(row -> Map.of(
                "packageId", row[0],
                "packageName", row[1],
                "totalReservations", row[2],
                "totalPassengers", row[3],
                "totalAmount", row[4]
        )).collect(Collectors.toList());
    }
}