// ─────────────────────────────────────────────────────────────
//  COMPONENTES UI — Design System Nexus Battles V
// ─────────────────────────────────────────────────────────────

import type { CSSProperties, ReactNode } from 'react';

// ── Tipos ──────────────────────────────────────────────────────
type BtnVariant  = 'primary' | 'arcane' | 'danger' | 'ghost';
type BadgeColor  = 'gold' | 'crimson' | 'arcane' | 'emerald' | 'ice' | 'gray';

// ── Divider ────────────────────────────────────────────────────
export const Divider = () => (
  <div style={{ display:'flex', alignItems:'center', gap:'1.5rem', margin:'1.2rem 0' }}>
    <div style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,var(--gold),transparent)' }}/>
    <span style={{ color:'var(--gold)', fontSize:'1rem', textShadow:'0 0 12px var(--gold-bright)', flexShrink:0 }}>⚜</span>
    <div style={{ flex:1, height:1, background:'linear-gradient(90deg,transparent,var(--gold),transparent)' }}/>
  </div>
);

// ── Btn ────────────────────────────────────────────────────────
const BTN_STYLES: Record<BtnVariant, CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg,var(--gold-dark),var(--gold-bright))',
    color: 'var(--abyss)',
    clipPath: 'polygon(10px 0%,calc(100% - 10px) 0%,100% 50%,calc(100% - 10px) 100%,10px 100%,0% 50%)',
    boxShadow: '0 0 20px rgba(200,134,10,0.3)',
  },
  arcane: {
    background: 'linear-gradient(135deg,var(--arcane),var(--arcane-bright))',
    color: 'var(--parchment)',
    clipPath: 'polygon(10px 0%,calc(100% - 10px) 0%,100% 50%,calc(100% - 10px) 100%,10px 100%,0% 50%)',
    boxShadow: '0 0 20px rgba(74,21,128,0.4)',
  },
  danger: {
    background: 'linear-gradient(135deg,var(--blood),var(--crimson-bright))',
    color: 'var(--parchment)',
    clipPath: 'polygon(10px 0%,calc(100% - 10px) 0%,100% 50%,calc(100% - 10px) 100%,10px 100%,0% 50%)',
    boxShadow: '0 0 15px rgba(168,16,32,0.3)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--gold)',
    border: '1px solid rgba(200,134,10,0.4)',
  },
};

interface BtnProps {
  children: ReactNode;
  variant?: BtnVariant;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
  title?: string;
}

export const Btn = ({ children, variant = 'primary', onClick, disabled = false, style = {}, title }: BtnProps) => (
  <button
    title={title}
    onClick={onClick}
    disabled={disabled}
    style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
      padding: '0.65rem 1.4rem',
      fontFamily: 'var(--font-heading)',
      fontSize: '0.74rem', letterSpacing: '0.2em', textTransform: 'uppercase',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.25s',
      opacity: disabled ? 0.55 : 1,
      border: 'none',
      ...BTN_STYLES[variant],
      ...style,
    }}
  >{children}</button>
);

// ── Badge ──────────────────────────────────────────────────────
const BADGE_COLORS: Record<BadgeColor, CSSProperties> = {
  gold:    { background:'rgba(200,134,10,0.15)', color:'var(--gold-light)',    border:'1px solid rgba(200,134,10,0.4)' },
  crimson: { background:'rgba(168,16,32,0.15)',  color:'var(--crimson-bright)',border:'1px solid rgba(168,16,32,0.4)' },
  arcane:  { background:'rgba(74,21,128,0.15)',  color:'var(--arcane-glow)',   border:'1px solid rgba(123,53,208,0.4)' },
  emerald: { background:'rgba(26,140,69,0.15)',  color:'var(--emerald-bright)',border:'1px solid rgba(26,140,69,0.4)' },
  ice:     { background:'rgba(26,127,170,0.15)', color:'var(--ice-bright)',    border:'1px solid rgba(26,127,170,0.4)' },
  gray:    { background:'rgba(74,61,50,0.3)',    color:'var(--rune-gray)',     border:'1px solid rgba(74,61,50,0.5)' },
};

interface BadgeProps { children: ReactNode; color?: BadgeColor; style?: CSSProperties; }
export const Badge = ({ children, color = 'gold', style = {} }: BadgeProps) => (
  <span style={{
    fontFamily: 'var(--font-heading)', fontSize: '0.6rem', letterSpacing: '0.2em',
    textTransform: 'uppercase', padding: '0.22rem 0.6rem', borderRadius: 1,
    display: 'inline-block',
    ...BADGE_COLORS[color], ...style,
  }}>{children}</span>
);

// ── Toast ──────────────────────────────────────────────────────
import type { Toast } from '../../hooks/useMissions';

const TOAST_STYLE: Record<Toast['type'], CSSProperties> = {
  success: { background:'rgba(26,140,69,0.12)',  borderLeftColor:'var(--emerald-bright)' },
  warning: { background:'rgba(200,134,10,0.12)', borderLeftColor:'var(--gold-bright)' },
  error:   { background:'rgba(168,16,32,0.12)',  borderLeftColor:'var(--crimson-bright)' },
  info:    { background:'rgba(74,21,128,0.12)',  borderLeftColor:'var(--arcane-glow)' },
};
const TOAST_ICON: Record<Toast['type'], string> = {
  success:'⚔', warning:'⏱', error:'💀', info:'🔮',
};

interface ToastProps { toast: Toast; onClose: (id: number) => void; }
export const ToastItem = ({ toast, onClose }: ToastProps) => (
  <div style={{
    display:'flex', alignItems:'flex-start', gap:'0.8rem', padding:'0.85rem 1rem',
    borderLeft:'3px solid',
    ...TOAST_STYLE[toast.type],
    animation:'notif-in 0.3s ease',
    boxShadow:'0 4px 20px rgba(0,0,0,0.6)',
    minWidth:280, maxWidth:340,
    backdropFilter:'blur(4px)',
  }}>
    <span style={{ fontSize:'1.1rem', flexShrink:0 }}>{TOAST_ICON[toast.type]}</span>
    <div style={{ flex:1 }}>
      <div style={{ fontFamily:'var(--font-heading)', fontSize:'0.77rem', letterSpacing:'0.05em', color:'var(--parchment)', marginBottom:'0.15rem' }}>{toast.title}</div>
      <div style={{ color:'var(--parchment-dim)', fontSize:'0.77rem', fontStyle:'italic' }}>{toast.msg}</div>
    </div>
    <button onClick={() => onClose(toast.id)} style={{ background:'transparent', border:'none', color:'var(--rune-gray)', fontSize:'0.9rem', cursor:'pointer', padding:0, flexShrink:0 }}>✕</button>
  </div>
);

// ── Skeleton loader ────────────────────────────────────────────
export const MissionSkeleton = () => (
  <div style={{
    display:'flex', alignItems:'center', gap:'1rem', padding:'1.2rem 1.4rem',
    background:'linear-gradient(135deg,rgba(74,21,128,0.05),rgba(10,7,5,0.7))',
    border:'1px solid rgba(123,53,208,0.1)',
    animation:'skeleton-pulse 1.4s ease-in-out infinite',
  }}>
    <div style={{ width:52, height:52, background:'rgba(74,21,128,0.15)', borderRadius:2, flexShrink:0 }}/>
    <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'0.5rem' }}>
      <div style={{ height:14, width:'55%', background:'rgba(200,134,10,0.12)', borderRadius:2 }}/>
      <div style={{ height:11, width:'80%', background:'rgba(200,134,10,0.07)', borderRadius:2 }}/>
    </div>
    <div style={{ width:60, height:32, background:'rgba(200,134,10,0.08)', borderRadius:2, flexShrink:0 }}/>
  </div>
);

// ── Formatear tiempo restante ──────────────────────────────────
export function formatTimeLeft(seconds: number): string {
  if (seconds <= 0) return 'Expirada';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ── Color por dificultad ───────────────────────────────────────
export function difficultyColor(diff: string): BadgeColor {
  const map: Record<string, BadgeColor> = {
    legendary: 'gold', epic: 'arcane', rare: 'ice', common: 'gray',
  };
  return map[diff] ?? 'gray';
}
