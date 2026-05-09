package com.travelagency.backend.services;

import com.travelagency.backend.entities.ClientEntity;
import com.travelagency.backend.repositories.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.travelagency.backend.utils.ValidationUtils;

import java.util.List;

@Service

public class ClientService {
    @Autowired
    private ClientRepository clientRepository;

    //CRUD : a)save/create b)read, c)update, d)delete

    //a save create perfil
    public ClientEntity saveClient(ClientEntity client) {
        ValidationUtils.validateField(client.getFullName(), "nombre completo");
        ValidationUtils.validateField(client.getEmail(), "email");

        if(clientRepository.existsByEmail(client.getEmail())){
            throw new IllegalArgumentException("Ya existe un perfil con ese email");
        }
        client.setActive(true);
        return clientRepository.save(client);

    }

    //read
    //Obtiene todos los usuarios (uso admin)
    public List<ClientEntity> getAllClients() {
        return clientRepository.findAll();
    }
    //b) read . Obtener un cliente por ID interno usuario especifico (admin uso)
    public ClientEntity getClientById(Long id) {
        ClientEntity client = clientRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("no se encontro el cliente con id : " + id));

        // Un usuario solo puede operar si su cuenta está activa
        if (!client.getActive()) {
            throw new IllegalStateException("La cuenta de este usuario se encuentra inactiva.");
        }
        return client;
    }

    //update, actualizar
    public ClientEntity updateClient(Long id, ClientEntity clientUpdates){
        ClientEntity existingClient = getClientById(id);

        //si se llega acá, es porque el usuario existe
        if (clientUpdates.getFullName() != null && !clientUpdates.getFullName().trim().isEmpty()) {
            existingClient.setFullName(clientUpdates.getFullName());
        }
        if (clientUpdates.getPhone() != null) {
            existingClient.setPhone(clientUpdates.getPhone());
        }
        if (clientUpdates.getIdDocument() != null) {
            existingClient.setIdDocument(clientUpdates.getIdDocument());
        }
        if (clientUpdates.getNationality() != null) {
            existingClient.setNationality(clientUpdates.getNationality());
        }
        return clientRepository.save(existingClient);
    }

    //desativar cuenta del cliente autenteicado
    public boolean deactivateMyAccount(Long id) {
        ClientEntity client = getClientById(id);
        return deactivate(client);
    }
    //Delete
    public boolean deactivateClientById(Long id) {
        ClientEntity client = getClientById(id);
        return deactivate(client);
    }

    // metodo para verificar que cliente que hace una reserva esté activo

    public ClientEntity getActiveClientById(Long id) {
        return getClientById(id); // ya valida active internamente
    }
    private boolean deactivate(ClientEntity client) {
        client.setActive(false);
        clientRepository.save(client);
        return true;
    }

    public ClientEntity getClientByEmail(String email) {
    return clientRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Client not found with email: " + email));
}
}