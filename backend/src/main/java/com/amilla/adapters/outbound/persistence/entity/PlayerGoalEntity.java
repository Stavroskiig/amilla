package com.amilla.adapters.outbound.persistence.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "player_goals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerGoalEntity {
    @Id
    private String playerName;
    
    private Integer goals;
}
