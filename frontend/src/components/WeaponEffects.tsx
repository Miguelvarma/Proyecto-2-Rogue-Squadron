// src/components/WeaponEffects.tsx
import React from 'react';

interface WeaponEffectsProps {
  effects: {
    ataque?: number;
    daño?: number;
    critico?: number;
    sanacion?: string | number;
    oponente_ataque?: number;
    oponente_critico?: number;
    defensa?: number;
    duracion_turnos?: number;
  };
  heroType: string;
}

export default function WeaponEffects({ effects, heroType }: WeaponEffectsProps) {
  const getEffectDescription = () => {
    const descriptions = [];
    
    if (effects.ataque) {
      descriptions.push(`+${effects.ataque} al ataque`);
    }
    if (effects.daño) {
      const duration = effects.duracion_turnos ? ` por ${effects.duracion_turnos} turnos` : '';
      descriptions.push(`+${effects.daño} al daño${duration}`);
    }
    if (effects.critico) {
      descriptions.push(`+${effects.critico}% de crítico al ataque`);
    }
    if (effects.defensa) {
      descriptions.push(`+${effects.defensa} a la defensa`);
    }
    if (effects.oponente_ataque) {
      descriptions.push(`${effects.oponente_ataque} al ataque del oponente`);
    }
    if (effects.oponente_critico) {
      descriptions.push(`${effects.oponente_critico}% de crítico al ataque del oponente`);
    }
    if (effects.sanacion) {
      const healValue = typeof effects.sanacion === 'number' 
        ? `+${effects.sanacion} de sanación`
        : `+${effects.sanacion} de sanación`;
      const duration = effects.duracion_turnos ? ` por ${effects.duracion_turnos} turnos` : '';
      descriptions.push(`${healValue}${duration}`);
    }
    
    return descriptions;
  };

  const effects_list = getEffectDescription();
  
  if (effects_list.length === 0) return null;
  
  return (
    <div className="weapon-effects">
      <strong>✨ Efectos:</strong>
      <ul>
        {effects_list.map((effect, index) => (
          <li key={index}>{effect}</li>
        ))}
      </ul>
    </div>
  );
}