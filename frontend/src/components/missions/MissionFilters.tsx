// ─────────────────────────────────────────────────────────────
//  MissionFilters — barra de filtros
// ─────────────────────────────────────────────────────────────

import type { MissionFilters } from '@/types/mission';
import { Badge } from './ui';

interface Props {
  filters: MissionFilters;
  onChange: (f: MissionFilters) => void;
  counts: { total: number; active: number; available: number; completed: number };
}

const STATUS_OPTS = [
  { value: 'all',       label: 'Todas' },
  { value: 'active',    label: '▶ Activas' },
  { value: 'available', label: '◈ Disponibles' },
  { value: 'completed', label: '✓ Completadas' },
] as const;

const DIFF_OPTS = [
  { value: 'all',       label: 'Cualquier dificultad' },
  { value: 'legendary', label: '★ Legendaria' },
  { value: 'epic',      label: '◆ Épica' },
  { value: 'rare',      label: '● Rara' },
  { value: 'common',    label: '· Común' },
] as const;

export function MissionFiltersBar({ filters, onChange, counts }: Props) {
  const filterBtn = (active: boolean) => ({
    fontFamily: 'var(--font-heading)' as const,
    fontSize: '0.63rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    padding: '0.3rem 0.8rem',
    border: '1px solid',
    transition: 'all 0.2s',
    cursor: 'pointer',
    borderColor:  active ? 'var(--gold)' : 'rgba(200,134,10,0.2)',
    color:        active ? 'var(--gold)' : 'var(--parchment-dim)',
    background:   active ? 'rgba(200,134,10,0.1)' : 'transparent',
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem', marginBottom:'1.4rem' }}>

      {/* Contadores */}
      <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
        {[
          { label:'Total', val: counts.total },
          { label:'Activas', val: counts.active, color:'var(--arcane-glow)' },
          { label:'Disponibles', val: counts.available, color:'var(--gold)' },
          { label:'Completadas', val: counts.completed, color:'var(--emerald-bright)' },
        ].map(c => (
          <div key={c.label} style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
            <span style={{ fontFamily:'var(--font-heading)', fontSize:'0.65rem', color:'var(--rune-gray)', letterSpacing:'0.15em', textTransform:'uppercase' }}>
              {c.label}
            </span>
            <Badge color={c.color === 'var(--arcane-glow)' ? 'arcane' : c.color === 'var(--emerald-bright)' ? 'emerald' : 'gold'}>
              {c.val}
            </Badge>
          </div>
        ))}
      </div>

      {/* Filtros de estado */}
      <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', alignItems:'center' }}>
        <span style={{ fontFamily:'var(--font-heading)', fontSize:'0.58rem', color:'var(--rune-gray)', letterSpacing:'0.25em', textTransform:'uppercase', marginRight:'0.3rem' }}>
          Estado:
        </span>
        {STATUS_OPTS.map(o => (
          <button key={o.value} onClick={() => onChange({ ...filters, status: o.value })}
            style={filterBtn(filters.status === o.value)}>
            {o.label}
          </button>
        ))}

        {/* Toggle IA */}
        <button
          onClick={() => onChange({ ...filters, aiOnly: !filters.aiOnly })}
          style={{
            ...filterBtn(!!filters.aiOnly),
            borderColor: filters.aiOnly ? 'var(--arcane-glow)' : 'rgba(123,53,208,0.2)',
            color:        filters.aiOnly ? 'var(--arcane-glow)' : 'var(--parchment-dim)',
            background:   filters.aiOnly ? 'rgba(74,21,128,0.15)' : 'transparent',
            marginLeft: '0.5rem',
          }}>
          🔮 Solo IA
        </button>
      </div>

      {/* Filtros de dificultad */}
      <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', alignItems:'center' }}>
        <span style={{ fontFamily:'var(--font-heading)', fontSize:'0.58rem', color:'var(--rune-gray)', letterSpacing:'0.25em', textTransform:'uppercase', marginRight:'0.3rem' }}>
          Dificultad:
        </span>
        {DIFF_OPTS.map(o => (
          <button key={o.value} onClick={() => onChange({ ...filters, difficulty: o.value })}
            style={filterBtn(filters.difficulty === o.value)}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
