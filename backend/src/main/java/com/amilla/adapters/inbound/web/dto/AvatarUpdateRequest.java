package com.amilla.adapters.inbound.web.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AvatarUpdateRequest {
    @NotBlank
    private String avatar;
}
