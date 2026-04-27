package com.travelagency.backend.entities;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

@Entity
@Table(name = "clients")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class ClientEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String fullName;

    private String phone;
    private String idDocument;
    private String nationality;


    //Para el borrado logico, solo se va a marcar como inactivo al cliente, para no perderlo en la BD
    @Column(nullable = false)
    private Boolean active = true;

}
