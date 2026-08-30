package com.travelagency.backend.controllers;

import com.travelagency.backend.entities.ClientEntity;
import com.travelagency.backend.services.ClientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clients")
@CrossOrigin("*")
public class ClientController {
    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    //create, POST /api/v1/clients . registrar perfil del cliente.
    @PostMapping("/")
    public ResponseEntity<ClientEntity> saveClient(@RequestBody ClientEntity client){
        ClientEntity savedClient = clientService.saveClient(client);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedClient);
    }

    //read. retornar el perfil del cliente
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ClientEntity> getMyProfile(@PathVariable Long id) {
        ClientEntity client = clientService.getClientById(id);
        return ResponseEntity.ok(client);
    }

    //update. Actualiza los datos del cliente
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ClientEntity> updateMyProfile(
            @PathVariable Long id,
            @RequestBody ClientEntity clientUpdates) {
        ClientEntity updated = clientService.updateClient(id, clientUpdates);
        return ResponseEntity.ok(updated);
    }

    //delete. Desactiva lógicamente la cuenta del cliente.
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Boolean> deactivateMyAccount(@PathVariable Long id) {
        clientService.deactivateMyAccount(id);
        return ResponseEntity.noContent().build();
    }

    //read. Retorna todos los clientes (uso admin)
    @GetMapping("/")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClientEntity>> getAllClients() {
        List<ClientEntity> clients = clientService.getAllClients();
        return ResponseEntity.ok(clients);
    }

    //delete. Desactiva lógicamente por ID (uso admin)
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateClientById(@PathVariable Long id) {
        clientService.deactivateClientById(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/by-email")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<ClientEntity> getClientByEmail(@RequestParam String email) {
        return ResponseEntity.ok(clientService.getClientByEmail(email));
    }
}


