// ─────────────────────────────────────────────────────────────
//  MissionCard — tarjeta individual de misión
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import type { Mission } from '@/types/mission';
import { Btn, Badge, difficultyColor, formatTimeLeft } from './ui';

interface Props {
  mission: Mission;
  isActioning: boolean;
  onComplete: (id: string) => void;
}

export function MissionCard({ mission, isActioning, onComplete }: Props) {
  const [hovered, setHovered] = useState(false);
  const isActive    = mission.status === 'active';
  const isCompleted = mission.status === 'completed';
  const isFailed    = mission.status === 'failed';

  const borderColor = isActive
    ? 'rgba(123,53,208,0.4)'
    : isCompleted
    ? 'rgba(40,192,96,0.3)'
    : isFailed
    ? 'rgba(212,32,48,0.3)'
    : 'rgba(123,53,208,0.15)';

  const bgColor = isActive
    ? 'linear-gradient(135deg,rgba(74,21,128,0.15),rgba(12,7,20,0.85))'
    : isCompleted
    ? 'linear-gradient(135deg,rgba(26,140,69,0.08),rgba(10,7,5,0.85))'
    : isFailed
    ? 'linear-gradient(135deg,rgba(168,16,32,0.08),rgba(10,7,5,0.85))'
    : 'linear-gradient(135deg,rgba(74,21,128,0.06),rgba(10,7,5,0.8))';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '1.2rem',
        padding: '1.1rem 1.4rem',
        background: bgColor,
        border: `1px solid ${borderColor}`,
        position: 'relative', overflow: 'hidden',
        transition: 'all 0.2s',
        transform: hovered ? 'translateX(3px)' : 'translateX(0)',
        boxShadow: hovered ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      {/* Barra lateral de estado */}
      {isActive && (
        <div style={{
          position:'absolute', left:0, top:0, bottom:0, width:3,
          background: 'linear-gradient(180deg,var(--arcane-glow),var(--arcane))',
        }}/>
      )}
      {isCompleted && (
        <div style={{
          position:'absolute', left:0, top:0, bottom:0, width:3,
          background: 'linear-gradient(180deg,var(--emerald-bright),var(--emerald))',
        }}/>
      )}

      {/* Icono */}
      <div style={{
        width:52, height:52, flexShrink:0,
        background: isActive ? 'rgba(74,21,128,0.3)' : 'rgba(200,134,10,0.08)',
        border: `1px solid ${isActive ? 'rgba(123,53,208,0.4)' : 'rgba(200,134,10,0.15)'}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:'1.6rem',
        opacity: isCompleted || isFailed ? 0.6 : 1,
      }}>
        {isCompleted ? '✅' : isFailed ? '💀' : (mission.icon ?? '⚔')}
      </div>

      {/* Contenido central */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.25rem' }}>
          <span style={{
            fontFamily: 'var(--font-heading)', fontSize:'0.88rem',
            color: isCompleted ? 'var(--emerald-bright)' : isFailed ? 'var(--crimson-bright)' : 'var(--parchment)',
            letterSpacing:'0.04em',
          }}>
            {mission.title}
          </span>
          {mission.difficulty && (
            <Badge color={difficultyColor(mission.difficulty)}>
              {mission.difficulty}
            </Badge>
          )}
          {mission.isAiGenerated && <Badge color="arcane">🔮 IA</Badge>}
          {isCompleted && <Badge color="emerald">✓ Completada</Badge>}
          {isFailed    && <Badge color="crimson">✕ Fallida</Badge>}
        </div>

        <p style={{
          fontSize:'0.82rem', color:'var(--parchment-dim)', fontStyle:'italic',
          marginBottom: isActive ? '0.6rem' : 0,
          whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
        }}>
          {mission.description}
        </p>

        {/* Barra de progreso — solo misiones activas */}
        {isActive && (
          <div style={{ display:'flex', alignItems:'center', gap:'0.7rem' }}>
            <div style={{ flex:1, height:5, background:'rgba(123,53,208,0.15)', borderRadius:3 }}>
              <div style={{
                height:'100%', width:`${mission.progressPct ?? 0}%`,
                background:'linear-gradient(90deg,var(--arcane),var(--arcane-glow))',
                borderRadius:3, boxShadow:'0 0 6px var(--arcane)',
                transition:'width 0.6s ease',
              }}/>
            </div>
            <span style={{
              fontFamily:'var(--font-heading)', fontSize:'0.78rem',
              color:'var(--arcane-glow)', flexShrink:0,
            }}>
              {mission.progressPct ?? 0}%
            </span>
          </div>
        )}
      </div>

      {/* Panel derecho */}
      <div style={{ textAlign:'right', flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.4rem' }}>
        <div style={{ fontFamily:'var(--font-heading)', fontSize:'0.78rem', color:'var(--gold)' }}>
          +{mission.reward.toLocaleString()} ✦
        </div>

        {!isCompleted && !isFailed && (
          <div style={{ fontSize:'0.63rem', color:'var(--crimson-bright)' }}>
            ⏱ {mission.timeLeftSeconds ? formatTimeLeft(mission.timeLeftSeconds) : 'En progreso'}
           </div>
        )}

        {isActive && (
          <Btn
            onClick={() => onComplete(mission.id)}
            disabled={isActioning}
            style={{ fontSize:'0.62rem', padding:'0.4rem 1rem', marginTop:'0.2rem' }}
          >
            {isActioning ? '⏳' : '✔ Completar'}
          </Btn>
        )}
      </div>
    </div>
  );
}