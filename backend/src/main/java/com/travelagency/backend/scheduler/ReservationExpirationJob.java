package com.travelagency.backend.scheduler;

import com.travelagency.backend.services.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReservationExpirationJob {

    @Autowired
    private ReservationService reservationService;

    @Scheduled(fixedRate = 3600000)
    public void expireReservations() {
        reservationService.expirePendingReservations();
    }
}