// ─────────────────────────────────────────────────────────────
//  MisionesPage — página principal del módulo
// ─────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { useMissions } from '@/hooks/useMissions';
import { MissionCard } from '@/components/missions/MissionCard';
import { MissionFiltersBar } from '@/components/missions/MissionFilters';
import { Btn, Divider, MissionSkeleton, ToastItem } from '@/components/missions/ui';

export function MisionesPage() {
  const {
    missions, loading, generating,
    actionId, toasts, filters,
    setFilters, handleGenerate,
    handleComplete,
    removeToast, reload,
  } = useMissions(); 

  // Contadores para la barra de filtros
  const counts = useMemo(() => ({
    total:      missions.length,
    active:     missions.filter(m => m.status === 'active').length,
    available:  missions.filter(m => m.status === 'available').length,
    completed:  missions.filter(m => m.status === 'completed').length,
  }), [missions]);

  return (
    <>
      {/* ── Página ───────────────────────────────────────────── */}
      <div style={{
        padding: '2rem',
        maxWidth: 1000,
        margin: '0 auto',
        animation: 'slide-in 0.3s ease',
      }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'1rem', gap:'1rem', flexWrap:'wrap' }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-title)',
              fontSize: 'clamp(1.6rem,4vw,2.2rem)',
              color: 'var(--gold)',
              filter: 'drop-shadow(0 0 15px rgba(200,134,10,0.4))',
              marginBottom: '0.3rem',
              lineHeight: 1.1,
            }}>
              🔮 Misiones
            </h1>
            <p style={{ color:'var(--parchment-dim)', fontStyle:'italic', fontSize:'1rem' }}>
              El oráculo arcano ha preparado tus próximas hazañas
            </p>
          </div>

          <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
            <Btn
              variant="ghost"
              onClick={() => reload()}
              disabled={loading}
              style={{ fontSize:'0.65rem', padding:'0.5rem 1rem' }}
              title="Recargar misiones"
            >
              ↺ Actualizar
            </Btn>
            <Btn
              variant="arcane"
              onClick={handleGenerate}
              disabled={generating}
              style={{ fontSize:'0.7rem' }}
            >
              {generating ? '⏳ Generando...' : '✨ Generar Misión IA'}
            </Btn>
          </div>
        </div>

        <Divider/>

        {/* Filtros */}
        <MissionFiltersBar
          filters={filters}
          onChange={setFilters}
          counts={counts}
        />

        {/* Lista de misiones */}
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.7rem' }}>
            {[1,2,3,4].map(i => <MissionSkeleton key={i}/>)}
          </div>
        ) : missions.length === 0 ? (
          <EmptyState onGenerate={handleGenerate} generating={generating}/>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.7rem' }}>
            {missions.map(m => (
              <MissionCard
                key={m.id}
                mission={m}
                isActioning={actionId === m.id}
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}

        {/* Footer info */}
        {!loading && missions.length > 0 && (
          <div style={{ marginTop:'1.5rem', textAlign:'center', fontSize:'0.72rem', color:'var(--ash)', fontStyle:'italic', fontFamily:'var(--font-heading)', letterSpacing:'0.15em' }}>
            ⚜ Se actualiza automáticamente cada 30 segundos ⚜
          </div>
        )}
      </div>

      {/* ── Toast container ───────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom:'1.5rem', right:'1.5rem',
        display: 'flex', flexDirection:'column', gap:'0.5rem',
        zIndex: 500,
      }}>
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={removeToast}/>
        ))}
      </div>
    </>
  );
}

export default MisionesPage;

// ── Estado vacío ───────────────────────────────────────────────
function EmptyState({ onGenerate, generating }: { onGenerate: () => void; generating: boolean }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 2rem',
      background: 'linear-gradient(145deg,var(--stone-dark),var(--dungeon))',
      border: '1px solid rgba(200,134,10,0.15)',
    }}>
      <div style={{ fontSize:'4rem', marginBottom:'1rem', opacity:0.4 }}>🔮</div>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: '1rem', color: 'var(--parchment-dim)',
        letterSpacing: '0.1em', marginBottom: '0.5rem',
      }}>
        No hay misiones con estos filtros
      </div>
      <p style={{ color:'var(--rune-gray)', fontStyle:'italic', fontSize:'0.9rem', marginBottom:'1.5rem' }}>
        Cambia los filtros o pide al oráculo que genere nuevas hazañas
      </p>
      <Btn variant="arcane" onClick={onGenerate} disabled={generating}>
        {generating ? '⏳ Generando...' : '✨ Generar Misión IA'}
      </Btn>
    </div>
  );
}
