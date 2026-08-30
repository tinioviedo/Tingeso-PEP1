package com.travelagency.backend.scheduler;

import com.travelagency.backend.services.ReservationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReservationExpirationJob {

    private final ReservationService reservationService;

    public ReservationExpirationJob(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @Scheduled(fixedRate = 3600000)
    public void expireReservations() {
        reservationService.expirePendingReservations();
    }
}