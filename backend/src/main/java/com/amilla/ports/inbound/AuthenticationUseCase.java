package com.amilla.ports.inbound;

import com.amilla.domain.model.User;

public interface AuthenticationUseCase {
    User register(String username, String email, String password, String groupCode);
    String login(String email, String password); // Returns JWT Token
    User getUserByEmail(String email);
}
