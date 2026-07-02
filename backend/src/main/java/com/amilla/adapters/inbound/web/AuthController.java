package com.amilla.adapters.inbound.web;

import com.amilla.adapters.inbound.web.dto.AuthResponse;
import com.amilla.adapters.inbound.web.dto.LoginRequest;
import com.amilla.adapters.inbound.web.dto.RegisterRequest;
import com.amilla.adapters.inbound.web.dto.AvatarUpdateRequest;
import com.amilla.adapters.inbound.web.dto.UserMeResponse;
import com.amilla.domain.model.User;
import com.amilla.ports.inbound.AuthenticationUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationUseCase authenticationUseCase;

    public AuthController(AuthenticationUseCase authenticationUseCase) {
        this.authenticationUseCase = authenticationUseCase;
    }

    @PostMapping("/register")
    public ResponseEntity<UserMeResponse> register(@Validated @RequestBody RegisterRequest request) {
        User user = authenticationUseCase.register(request.getUsername(), request.getEmail(), request.getPassword(), request.getGroupCode());
        return ResponseEntity.ok(UserMeResponse.fromUser(user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Validated @RequestBody LoginRequest request) {
        String token = authenticationUseCase.login(request.getEmail(), request.getPassword());
        User user = authenticationUseCase.getUserByEmail(request.getEmail());
        
        AuthResponse response = new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getTotalPoints(),
                user.getAvatar()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserMeResponse> getMe() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = authenticationUseCase.getUserByEmail(email);
        return ResponseEntity.ok(UserMeResponse.fromUser(user));
    }

    @PutMapping("/avatar")
    public ResponseEntity<UserMeResponse> updateAvatar(@Validated @RequestBody AvatarUpdateRequest request) {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User updatedUser = authenticationUseCase.updateAvatar(email, request.getAvatar());
        return ResponseEntity.ok(UserMeResponse.fromUser(updatedUser));
    }
}
