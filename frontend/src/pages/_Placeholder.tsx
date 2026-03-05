// ══════════════════════════════════════════════════════
// PAGES — Cada página es un componente React independiente
// El equipo de frontend implementa el contenido aquí.
// Usar los hooks de /hooks y los módulos de /api para datos.
// ══════════════════════════════════════════════════════

const Placeholder = ({ name }: { name: string }) => (
  <div style={{ padding: '2rem', fontFamily: 'var(--font-heading)', color: 'var(--color-gold)' }}>
    <h1>{name}</h1>
    <p style={{ color: 'var(--color-parchment-dim)', fontFamily: 'var(--font-body)', marginTop: '0.5rem' }}>
      Pendiente de implementación por el equipo frontend.
    </p>
  </div>
);

export default Placeholder;
