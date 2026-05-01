// Implementa la paginación del enunciado:
// Muestra máximo 10 páginas visibles. Si hay más a la izquierda → flecha ←. Si hay más a la derecha → flecha →.

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const WINDOW = 10;

  // Calcular ventana de páginas visibles
  let start = Math.max(1, page - Math.floor(WINDOW / 2));
  let end   = Math.min(totalPages, start + WINDOW - 1);
  if (end - start < WINDOW - 1) start = Math.max(1, end - WINDOW + 1);

  const visiblePages = [];
  for (let i = start; i <= end; i++) visiblePages.push(i);

  const showLeftArrow  = start > 1;
  const showRightArrow = end < totalPages;

  return (
    <div style={styles.wrap}>
      {/* Flecha izquierda */}
      {showLeftArrow && (
        <button
          style={styles.arrow}
          onClick={() => onPageChange(start - 1)}
          title="Páginas anteriores"
        >
          ‹
        </button>
      )}

      {/* Páginas */}
      {visiblePages.map(p => (
        <button
          key={p}
          style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      {/* Flecha derecha */}
      {showRightArrow && (
        <button
          style={styles.arrow}
          onClick={() => onPageChange(end + 1)}
          title="Páginas siguientes"
        >
          ›
        </button>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.3rem',
    padding: '2rem 0 1rem',
    flexWrap: 'wrap',
  },
  pageBtn: {
    minWidth: '36px', height: '36px',
    padding: '0 0.4rem',
    background: 'transparent',
    border: '1px solid #1e2d45',
    borderRadius: '6px',
    color: '#8a93a8',
    fontSize: '0.88rem',
    fontFamily: "'Exo 2', sans-serif",
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  },
  pageBtnActive: {
    background: 'linear-gradient(135deg, #c9a84c, #a87c30)',
    border: '1px solid #c9a84c',
    color: '#0a0800',
    fontWeight: 700,
    boxShadow: '0 0 10px rgba(201,168,76,0.3)',
  },
  arrow: {
    minWidth: '36px', height: '36px',
    padding: '0 0.4rem',
    background: 'rgba(201,168,76,0.08)',
    border: '1px solid #6b5520',
    borderRadius: '6px',
    color: '#c9a84c',
    fontSize: '1.2rem',
    lineHeight: 1,
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    fontFamily: "'Exo 2', sans-serif",
  },
};
