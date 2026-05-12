package com.travelagency.backend.services;

import com.travelagency.backend.entities.ClientEntity;
import com.travelagency.backend.repositories.ClientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @InjectMocks
    private ClientService clientService;

    @Mock
    private ClientRepository clientRepository;

    private ClientEntity validClient;

    @BeforeEach
    void setUp() {
        validClient = new ClientEntity();
        validClient.setId(1L);
        validClient.setFullName("Martin Perez");
        validClient.setEmail("martin@test.com");
        validClient.setPhone("123456789");
        validClient.setActive(true);
    }

    // ── saveClient ────────────────────────────────────────────────────────────

    @Test
    void saveClient_validClient_returnsSavedClient() {
        // Given
        when(clientRepository.existsByEmail(validClient.getEmail())).thenReturn(false);
        when(clientRepository.save(any())).thenReturn(validClient);

        // When
        ClientEntity result = clientService.saveClient(validClient);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getFullName()).isEqualTo("Martin Perez");
        verify(clientRepository).save(any());
    }

    @Test
    void saveClient_nullFullName_throwsIllegalArgument() {
        // Given
        validClient.setFullName(null);

        // When / Then
        assertThatThrownBy(() -> clientService.saveClient(validClient))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void saveClient_nullEmail_throwsIllegalArgument() {
        // Given
        validClient.setEmail(null);

        // When / Then
        assertThatThrownBy(() -> clientService.saveClient(validClient))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void saveClient_duplicateEmail_throwsIllegalArgument() {
        // Given
        when(clientRepository.existsByEmail(validClient.getEmail())).thenReturn(true);

        // When / Then
        assertThatThrownBy(() -> clientService.saveClient(validClient))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("email");
    }

    @Test
    void saveClient_setsActiveTrue() {
        // Given
        validClient.setActive(false);
        when(clientRepository.existsByEmail(any())).thenReturn(false);
        when(clientRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        ClientEntity result = clientService.saveClient(validClient);

        // Then
        assertThat(result.getActive()).isTrue();
    }

    // ── getClientById ─────────────────────────────────────────────────────────

    @Test
    void getClientById_existingActiveClient_returnsClient() {
        // Given
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));

        // When
        ClientEntity result = clientService.getClientById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void getClientById_nonExistingId_throwsIllegalArgument() {
        // Given
        when(clientRepository.findById(99L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> clientService.getClientById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getClientById_inactiveClient_throwsIllegalState() {
        // Given
        validClient.setActive(false);
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));

        // When / Then
        assertThatThrownBy(() -> clientService.getClientById(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("inactiva");
    }

    @Test
    void getClientById_returnsCorrectEmail() {
        // Given
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));

        // When
        ClientEntity result = clientService.getClientById(1L);

        // Then
        assertThat(result.getEmail()).isEqualTo("martin@test.com");
    }

    @Test
    void getClientById_repositoryCalledWithCorrectId() {
        // Given
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));

        // When
        clientService.getClientById(1L);

        // Then
        verify(clientRepository).findById(1L);
    }

    // ── updateClient ──────────────────────────────────────────────────────────

    @Test
    void updateClient_validFields_updatesSuccessfully() {
        // Given
        ClientEntity updates = new ClientEntity();
        updates.setFullName("Nuevo Nombre");
        updates.setPhone("987654321");
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));
        when(clientRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        ClientEntity result = clientService.updateClient(1L, updates);

        // Then
        assertThat(result.getFullName()).isEqualTo("Nuevo Nombre");
        assertThat(result.getPhone()).isEqualTo("987654321");
    }

    @Test
    void updateClient_blankName_doesNotUpdateName() {
        // Given — nombre en blanco no debe sobreescribir el existente
        ClientEntity updates = new ClientEntity();
        updates.setFullName("   ");
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));
        when(clientRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        ClientEntity result = clientService.updateClient(1L, updates);

        // Then
        assertThat(result.getFullName()).isEqualTo("Martin Perez");
    }

    @Test
    void updateClient_updatesNationality() {
        // Given
        ClientEntity updates = new ClientEntity();
        updates.setNationality("Chilena");
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));
        when(clientRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        ClientEntity result = clientService.updateClient(1L, updates);

        // Then
        assertThat(result.getNationality()).isEqualTo("Chilena");
    }

    @Test
    void updateClient_inactiveClient_throwsIllegalState() {
        // Given
        validClient.setActive(false);
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));

        // When / Then
        assertThatThrownBy(() -> clientService.updateClient(1L, new ClientEntity()))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void updateClient_savesResult() {
        // Given
        ClientEntity updates = new ClientEntity();
        updates.setPhone("111222333");
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));
        when(clientRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        clientService.updateClient(1L, updates);

        // Then
        verify(clientRepository).save(any());
    }

    // ── deactivateMyAccount ───────────────────────────────────────────────────

    @Test
    void deactivateMyAccount_activeClient_returnsTrue() {
        // Given
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));
        when(clientRepository.save(any())).thenReturn(validClient);

        // When
        boolean result = clientService.deactivateMyAccount(1L);

        // Then
        assertThat(result).isTrue();
    }

    @Test
    void deactivateMyAccount_setsActiveToFalse() {
        // Given
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));
        when(clientRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        clientService.deactivateMyAccount(1L);

        // Then
        assertThat(validClient.getActive()).isFalse();
    }

    @Test
    void deactivateMyAccount_nonExistingId_throwsIllegalArgument() {
        // Given
        when(clientRepository.findById(99L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> clientService.deactivateMyAccount(99L))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void deactivateMyAccount_alreadyInactiveClient_throwsIllegalState() {
        // Given
        validClient.setActive(false);
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));

        // When / Then
        assertThatThrownBy(() -> clientService.deactivateMyAccount(1L))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void deactivateMyAccount_savesDeactivatedClient() {
        // Given
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));
        when(clientRepository.save(any())).thenReturn(validClient);

        // When
        clientService.deactivateMyAccount(1L);

        // Then
        verify(clientRepository).save(any());
    }

    // ── getAllClients ─────────────────────────────────────────────────────────

    @Test
    void getAllClients_returnsAllClients() {
        // Given
        when(clientRepository.findAll()).thenReturn(List.of(validClient));

        // When
        List<ClientEntity> result = clientService.getAllClients();

        // Then
        assertThat(result).hasSize(1);
    }

    @Test
    void getAllClients_emptyRepository_returnsEmptyList() {
        // Given
        when(clientRepository.findAll()).thenReturn(List.of());

        // When
        List<ClientEntity> result = clientService.getAllClients();

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getAllClients_repositoryCalled() {
        // Given
        when(clientRepository.findAll()).thenReturn(List.of());

        // When
        clientService.getAllClients();

        // Then
        verify(clientRepository).findAll();
    }

    @Test
    void getAllClients_multipleClients_allReturned() {
        // Given
        ClientEntity c2 = new ClientEntity();
        c2.setId(2L);
        when(clientRepository.findAll()).thenReturn(List.of(validClient, c2));

        // When
        List<ClientEntity> result = clientService.getAllClients();

        // Then
        assertThat(result).hasSize(2);
    }

    @Test
    void getAllClients_returnsCorrectEmail() {
        // Given
        when(clientRepository.findAll()).thenReturn(List.of(validClient));

        // When
        List<ClientEntity> result = clientService.getAllClients();

        // Then
        assertThat(result.get(0).getEmail()).isEqualTo("martin@test.com");
    }

    // ── deactivateClientById ──────────────────────────────────────────────────

    @Test
    void deactivateClientById_activeClient_returnsTrue() {
        // Given
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));
        when(clientRepository.save(any())).thenReturn(validClient);

        // When
        boolean result = clientService.deactivateClientById(1L);

        // Then
        assertThat(result).isTrue();
    }

    @Test
    void deactivateClientById_setsActiveToFalse() {
        // Given
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));
        when(clientRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        clientService.deactivateClientById(1L);

        // Then
        assertThat(validClient.getActive()).isFalse();
    }

    @Test
    void deactivateClientById_nonExistingId_throwsIllegalArgument() {
        // Given
        when(clientRepository.findById(99L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> clientService.deactivateClientById(99L))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void deactivateClientById_inactiveClient_throwsIllegalState() {
        // Given
        validClient.setActive(false);
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));

        // When / Then
        assertThatThrownBy(() -> clientService.deactivateClientById(1L))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void deactivateClientById_savesDeactivatedClient() {
        // Given
        when(clientRepository.findById(1L)).thenReturn(Optional.of(validClient));
        when(clientRepository.save(any())).thenReturn(validClient);

        // When
        clientService.deactivateClientById(1L);

        // Then
        verify(clientRepository).save(any());
    }

    // ── getClientByEmail ──────────────────────────────────────────────────────

    @Test
    void getClientByEmail_existingEmail_returnsClient() {
        // Given
        when(clientRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(validClient));

        // When
        ClientEntity result = clientService.getClientByEmail("martin@test.com");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getEmail()).isEqualTo("martin@test.com");
    }

    @Test
    void getClientByEmail_nonExistingEmail_throwsIllegalArgument() {
        // Given
        when(clientRepository.findByEmail("noexiste@test.com")).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> clientService.getClientByEmail("noexiste@test.com"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("noexiste@test.com");
    }

    @Test
    void getClientByEmail_repositoryCalledWithCorrectEmail() {
        // Given
        when(clientRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(validClient));

        // When
        clientService.getClientByEmail("martin@test.com");

        // Then
        verify(clientRepository).findByEmail("martin@test.com");
    }

    @Test
    void getClientByEmail_returnsCorrectName() {
        // Given
        when(clientRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(validClient));

        // When
        ClientEntity result = clientService.getClientByEmail("martin@test.com");

        // Then
        assertThat(result.getFullName()).isEqualTo("Martin Perez");
    }

    @Test
    void getClientByEmail_returnsActiveClient() {
        // Given
        when(clientRepository.findByEmail("martin@test.com")).thenReturn(Optional.of(validClient));

        // When
        ClientEntity result = clientService.getClientByEmail("martin@test.com");

        // Then
        assertThat(result.getActive()).isTrue();
    }
}
