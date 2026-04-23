/**
 * OrderStatusBadge.tsx
 * Animated badge showing the current status of a payment order.
 */

import React from 'react';
import type { OrderStatus } from '../../api/payments';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; border: string; icon: string }> = {
  PENDING:    { label: 'Pendiente',   color: '#F5C842', bg: 'rgba(200,134,10,0.12)', border: 'rgba(200,134,10,0.4)', icon: '⏳' },
  PROCESSING: { label: 'Procesando',  color: '#B06EFF', bg: 'rgba(74,21,128,0.15)',  border: 'rgba(123,53,208,0.4)', icon: '⚜' },
  PAID:       { label: 'Pagado',      color: '#28C060', bg: 'rgba(26,140,69,0.12)',  border: 'rgba(26,140,69,0.4)',  icon: '✦' },
  FAILED:     { label: 'Fallido',     color: '#D42030', bg: 'rgba(168,16,32,0.12)',  border: 'rgba(168,16,32,0.4)', icon: '✕' },
  REFUNDED:   { label: 'Reembolsado', color: '#30B8E8', bg: 'rgba(26,127,170,0.12)', border: 'rgba(26,127,170,0.4)', icon: '↩' },
  CANCELLED:  { label: 'Cancelado',   color: '#7A6A58', bg: 'rgba(74,61,50,0.2)',   border: 'rgba(74,61,50,0.4)',   icon: '–' },
};

interface Props {
  readonly status: OrderStatus;
  readonly size?:  'sm' | 'md';
}

export function OrderStatusBadge({ status, size = 'md' }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const isPulsing = status === 'PROCESSING' || status === 'PENDING';

  return (
    <span style={{
      display:       'inline-flex',
      alignItems:    'center',
      gap:           '0.3rem',
      fontFamily:    'var(--font-heading)',
      fontSize:      size === 'sm' ? '0.6rem' : '0.7rem',
      letterSpacing: '0.2em',
      textTransform: 'uppercase',
      padding:       size === 'sm' ? '0.15rem 0.4rem' : '0.25rem 0.6rem',
      color:         cfg.color,
      background:    cfg.bg,
      border:        `1px solid ${cfg.border}`,
      animation:     isPulsing ? 'pulse-badge 2s ease-in-out infinite' : 'none',
    }}>
      <style>{`
        @keyframes pulse-badge {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.65; }
        }
      `}</style>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}
