package com.amilla.adapters.inbound.web.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LongTermRequest {
    @NotBlank
    private String championTeam;
}
