package com.amilla.adapters.inbound.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Το όνομα χρήστη είναι υποχρεωτικό!")
    @Size(min = 3, max = 20, message = "Το όνομα χρήστη πρέπει να είναι μεταξύ 3 και 20 χαρακτήρων!")
    private String username;

    @NotBlank(message = "Το email είναι υποχρεωτικό!")
    @Email(message = "Μη έγκυρη μορφή email!")
    private String email;

    @NotBlank(message = "Ο κωδικός πρόσβασης είναι υποχρεωτικός!")
    @Size(min = 6, max = 40, message = "Ο κωδικός πρόσβασης πρέπει να είναι μεταξύ 6 και 40 χαρακτήρων!")
    private String password;

    @NotBlank(message = "Ο κωδικός ομάδας είναι υποχρεωτικός!")
    private String groupCode;
}
