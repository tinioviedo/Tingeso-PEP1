package com.travelagency.backend.services;

import com.travelagency.backend.entities.PackageEntity;
import com.travelagency.backend.enums.PackageStatus;
import com.travelagency.backend.repositories.PackageRepository;
import com.travelagency.backend.utils.ValidationUtils;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.List;

@Service
public class PackageService {

    private static final String NO_SLOTS_TO_PUBLISH =
            "No se puede publicar un paquete sin cupos disponibles.";

    private final PackageRepository packageRepository;

    public PackageService(PackageRepository packageRepository) {
        this.packageRepository = packageRepository;
    }

    //Create . crear el paquete
    public PackageEntity savePackage(PackageEntity newPackage) {

        // Campos de texto obligatorios — usando ValidationUtils
        ValidationUtils.validateField(newPackage.getPackageName(), "nombre del paquete");
        ValidationUtils.validateField(newPackage.getDestination(), "destino");
        ValidationUtils.validateField(newPackage.getDescription(), "descripción");

        //El precio debe ser mayor que cero
        if (newPackage.getPrice() <=0){
            throw new IllegalArgumentException("EL precio del paquete debe ser mayor que cero");
        }

        //Fecha de termino debe ser posterior a la fecha del inicio
        if (newPackage.getEndDate().isBefore(newPackage.getStartDate()) || newPackage.getEndDate().isEqual(newPackage.getStartDate())){
            throw new IllegalArgumentException("la fecha de termino debe ser posterior a fecha de inicio");
        }

        //Valiar cupos . "Cupos totales mayores que cero"
        if (newPackage.getSlots() == null || newPackage.getSlots() <=0 ) {
            throw new IllegalArgumentException("Los cupos deben ser mayayores a cero");
        }

        //Un paquete no puede publicarse como disponible si no tiene cupos. (DISPONIBLE ES UNO AVAILABLE EN EL ENUM)
        if (newPackage.getPackageStatus() == null){
            newPackage.setPackageStatus(PackageStatus.AVAILABLE);
        }
        //Al momento de crearse, los cupos Disponibles son iguales a los actuales
        newPackage.setAvailableSlots(newPackage.getSlots());

        //no sé si deba ver el caso que esté AVAILABLE pero que no tenga cupos??
        if (newPackage.getPackageStatus() == PackageStatus.AVAILABLE && newPackage.getAvailableSlots() <= 0) {
            throw new IllegalArgumentException(NO_SLOTS_TO_PUBLISH);
        }
        return packageRepository.save(newPackage);
    }

    //read
    //Todos los paquetes (admin)
    public List<PackageEntity> getAllPackages() {
        return packageRepository.findAll();
    }

    // un paquete por id
    public PackageEntity getPackageById(Long id) {
        return packageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("No se encontro el paquete con el id :" + id));

    }

    //Solo disponibles para clientes (Epica3)
    //filtrar por available, con cupos y fechas validaas desde hoy?
    public List<PackageEntity> getAvailablePackages() {
        return packageRepository.findAvailablePackages(PackageStatus.AVAILABLE, LocalDate.now());

    }
    // Búsqueda con filtros opcionales (Épica 3)
    // Filtramos en memoria sobre los paquetes disponibles para evitar el bug
    // conocido de JPQL con (:param IS NULL OR ...) y parámetros numéricos en PostgreSQL.
    public List<PackageEntity> searchPackage(String destination, Double minPrice, Double maxPrice, String tripType) {
        String normalizedDestination = normalizeText(destination);
        return packageRepository.findAvailablePackages(PackageStatus.AVAILABLE, LocalDate.now())
                .stream()
                .filter(p -> destination == null || destination.isBlank() ||
                        normalizeText(p.getDestination()).contains(normalizedDestination) ||
                        normalizeText(p.getPackageName()).contains(normalizedDestination))
                .filter(p -> minPrice == null || p.getPrice() >= minPrice)
                .filter(p -> maxPrice == null || p.getPrice() <= maxPrice)
                .filter(p -> tripType == null || tripType.isBlank() ||
                        (p.getTripType() != null && p.getTripType().equalsIgnoreCase(tripType)))
                .toList();
    }

    private String normalizeText(String s) {
        if (s == null) return "";
        return Normalizer.normalize(s.toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
    }


    //UPDATE
    public PackageEntity updatePackage(Long id, PackageEntity updatesPackage) {
        PackageEntity existingPackage = getPackageById(id);

        // Cuántos cupos ya están reservados
        // Si slots=20 y availableSlots=15, entonces 5 ya están reservados
        int reservedSlots = existingPackage.getSlots() - existingPackage.getAvailableSlots();

        applyDescriptiveFields(existingPackage, updatesPackage);
        applyDates(existingPackage, updatesPackage, reservedSlots);
        applySlots(existingPackage, updatesPackage, reservedSlots);
        applyStatus(existingPackage, updatesPackage);

        return packageRepository.save(existingPackage);
    }

    // Campos descriptivos y precio: se sobrescriben sólo si vienen informados.
    private void applyDescriptiveFields(PackageEntity existingPackage, PackageEntity updatesPackage) {
        if (updatesPackage.getPackageName() != null && !updatesPackage.getPackageName().isBlank()) {
            existingPackage.setPackageName(updatesPackage.getPackageName());
        }
        if (updatesPackage.getDestination() != null && !updatesPackage.getDestination().isBlank()) {
            existingPackage.setDestination(updatesPackage.getDestination());
        }
        if (updatesPackage.getDescription() != null && !updatesPackage.getDescription().isBlank()) {
            existingPackage.setDescription(updatesPackage.getDescription());
        }
        if (updatesPackage.getIncludedServices() != null) {
            existingPackage.setIncludedServices(updatesPackage.getIncludedServices());
        }
        if (updatesPackage.getConditions() != null) {
            existingPackage.setConditions(updatesPackage.getConditions());
        }
        if (updatesPackage.getTripType() != null) {
            existingPackage.setTripType(updatesPackage.getTripType());
        }
        if (updatesPackage.getPrice() > 0) {
            existingPackage.setPrice(updatesPackage.getPrice());
        }
    }

    // Regla: no se pueden modificar fechas de un paquete que ya tiene reservas.
    // La validación se hace UNA SOLA VEZ antes de tocar cualquier fecha.
    private void applyDates(PackageEntity existingPackage, PackageEntity updatesPackage, int reservedSlots) {
        if ((updatesPackage.getStartDate() != null || updatesPackage.getEndDate() != null) && reservedSlots > 0) {
            throw new IllegalArgumentException("No se pueden modificar fechas de un paquete con reservas.");
        }
        if (updatesPackage.getStartDate() != null) {
            existingPackage.setStartDate(updatesPackage.getStartDate());
        }
        if (updatesPackage.getEndDate() != null) {
            if (!updatesPackage.getEndDate().isAfter(existingPackage.getStartDate())) {
                throw new IllegalArgumentException("La fecha de término debe ser posterior a la fecha de inicio.");
            }
            existingPackage.setEndDate(updatesPackage.getEndDate());
        }
    }

    // Regla: no se pueden reducir los cupos totales por debajo de los ya reservados.
    private void applySlots(PackageEntity existingPackage, PackageEntity updatesPackage, int reservedSlots) {
        if (updatesPackage.getSlots() == null) {
            return;
        }
        if (updatesPackage.getSlots() <= 0) {
            throw new IllegalArgumentException("Los cupos deben ser mayores que cero.");
        }
        if (updatesPackage.getSlots() < reservedSlots) {
            throw new IllegalArgumentException(
                    "No se pueden reducir los cupos a " + updatesPackage.getSlots() +
                            " porque hay " + reservedSlots + " reservados.");
        }
        // diff ajusta los disponibles sin perder las reservas hechas
        // Ej: tenías 20 totales, 15 disponibles. Subes a 25. diff=+5. Disponibles pasan a 20.
        int diff = updatesPackage.getSlots() - existingPackage.getSlots();
        existingPackage.setSlots(updatesPackage.getSlots());
        existingPackage.setAvailableSlots(existingPackage.getAvailableSlots() + diff);
    }

    private void applyStatus(PackageEntity existingPackage, PackageEntity updatesPackage) {
        if (updatesPackage.getPackageStatus() == null) {
            return;
        }
        if (updatesPackage.getPackageStatus() == PackageStatus.AVAILABLE
                && existingPackage.getAvailableSlots() <= 0) {
            throw new IllegalArgumentException(NO_SLOTS_TO_PUBLISH);
        }
        existingPackage.setPackageStatus(updatesPackage.getPackageStatus());
    }

    // ── CAMBIAR SOLO EL ESTADO ────────────────────────────────────────────────

    // Cambia únicamente el estado sin tocar otros campos
    // Regla: paquetes con reservas no se eliminan — solo cambian de estado
    public PackageEntity changeStatus(Long id, PackageStatus newStatus) {
        PackageEntity pkg = getPackageById(id);

        if (newStatus == PackageStatus.AVAILABLE && pkg.getAvailableSlots() <= 0) {
            throw new IllegalArgumentException(NO_SLOTS_TO_PUBLISH);
        }

        pkg.setPackageStatus(newStatus);
        return packageRepository.save(pkg);
    }

    // ── MANEJO DE CUPOS ───────────────────────────────────────────────────────
    // Estos métodos los llama ReservationService, no el controller directamente

    // Descuenta cupos al crear una reserva
    public PackageEntity deductSlots(Long packageId, int quantity) {
        PackageEntity pkg = getPackageById(packageId);

        if (pkg.getAvailableSlots() < quantity) {
            throw new IllegalArgumentException(
                    "No hay suficientes cupos. Disponibles: " + pkg.getAvailableSlots());
        }

        pkg.setAvailableSlots(pkg.getAvailableSlots() - quantity);

        // Si se agotaron los cupos, cambia automáticamente a SOLD_OUT
        if (pkg.getAvailableSlots() == 0) {
            pkg.setPackageStatus(PackageStatus.SOLD_OUT);
        }

        return packageRepository.save(pkg);
    }

    // Libera cupos si una reserva se cancela o expira
    public PackageEntity releaseSlots(Long packageId, int quantity) {
        PackageEntity pkg = getPackageById(packageId);
        int released = Math.min(pkg.getAvailableSlots() + quantity, pkg.getSlots());
        pkg.setAvailableSlots(released);

        // Si estaba agotado y volvieron cupos, regresa a AVAILABLE
        if (pkg.getPackageStatus() == PackageStatus.SOLD_OUT && pkg.getAvailableSlots() > 0) {
            pkg.setPackageStatus(PackageStatus.AVAILABLE);
        }

        return packageRepository.save(pkg);
    }
}
