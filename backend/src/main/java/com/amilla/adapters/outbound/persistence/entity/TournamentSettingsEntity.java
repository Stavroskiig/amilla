package com.amilla.adapters.outbound.persistence.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tournament_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentSettingsEntity {
    @Id
    private String settingKey;
    
    private String settingValue;
}
