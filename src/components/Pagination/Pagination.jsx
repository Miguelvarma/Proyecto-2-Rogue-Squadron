import "./Pagination.css";

function getWindowStart(page, windowSize) {
  // Ventanas: 1-10, 11-20, 21-30...
  return Math.floor((page - 1) / windowSize) * windowSize + 1;
}

export default function Pagination({
  page,
  totalPages,
  onPageChange,
  windowSize = 10,
}) {
  if (totalPages <= 1) return null;

  const windowStart = getWindowStart(page, windowSize);
  const windowEnd = Math.min(windowStart + windowSize - 1, totalPages);

  const pages = [];
  for (let p = windowStart; p <= windowEnd; p++) pages.push(p);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Flechas “laterales” para moverse entre ventanas (cuando hay +10 páginas)
  const hasMoreThanOneWindow = totalPages > windowSize;
  const canPrevWindow = windowStart > 1;
  const canNextWindow = windowEnd < totalPages;

  function goTo(p) {
    onPageChange(p);
  }

  function prevPage() {
    if (canPrev) goTo(page - 1);
  }

  function nextPage() {
    if (canNext) goTo(page + 1);
  }

  function prevWindow() {
    if (!canPrevWindow) return;
    // Ir al inicio de la ventana anterior (o al último de esa ventana si prefieres)
    goTo(windowStart - windowSize);
  }

  function nextWindow() {
    if (!canNextWindow) return;
    goTo(windowStart + windowSize);
  }

  return (
    <nav className="pager" aria-label="Paginación">
      {/* Flechas de página */}
      <button className="pager__btn" onClick={prevPage} disabled={!canPrev}>
        ‹
      </button>

      {/* Flechas laterales (para ventanas 1-10, 11-20...) */}
      {hasMoreThanOneWindow && (
        <button
          className="pager__btn"
          onClick={prevWindow}
          disabled={!canPrevWindow}
          title="10 páginas atrás"
        >
          «
        </button>
      )}

      {/* Botones numerados 1..10 (o la ventana actual) */}
      <div className="pager__nums" role="list">
        {pages.map((p) => (
          <button
            key={p}
            className={`pager__num ${p === page ? "is-active" : ""}`}
            onClick={() => goTo(p)}
            aria-current={p === page ? "page" : undefined}
            role="listitem"
          >
            {p}
          </button>
        ))}
      </div>

      {hasMoreThanOneWindow && (
        <button
          className="pager__btn"
          onClick={nextWindow}
          disabled={!canNextWindow}
          title="10 páginas adelante"
        >
          »
        </button>
      )}

      <button className="pager__btn" onClick={nextPage} disabled={!canNext}>
        ›
      </button>

      <div className="pager__info">
        Página <strong>{page}</strong> de <strong>{totalPages}</strong>
      </div>
    </nav>
  );
}