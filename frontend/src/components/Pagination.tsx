import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Si no hay múltiples páginas, no mostrar nada
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Mostrar todas las páginas
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        // Cerca del inicio: 1 2 3 4 5
        for (let i = 1; i <= 5; i++) pages.push(i);
      } else if (currentPage >= totalPages - 2) {
        // Cerca del final: total-4 total-3 total-2 total-1 total
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        // En medio: current-2 current-1 current current+1 current+2
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
      }
    }
    return pages;
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="pagination">
      {/* Botón primera página */}
      <button
        className="pagination__arrow"
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        title="Primera página"
      >
        ««
      </button>

      {/* Botón página anterior */}
      <button
        className="pagination__btn"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Anterior
      </button>

      {/* Números de página */}
      <div className="pagination__numbers">
        {getPageNumbers().map(num => (
          <button
            key={num}
            className={`pagination__number ${num === currentPage ? 'active' : ''}`}
            onClick={() => goToPage(num)}
          >
            {num}
          </button>
        ))}
      </div>

      {/* Botón página siguiente */}
      <button
        className="pagination__btn"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </button>

      {/* Botón última página */}
      <button
        className="pagination__arrow"
        onClick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        title="Última página"
      >
        »»
      </button>

      {/* Información de página */}
      <span className="pagination__info">
        Página {currentPage} de {totalPages}
      </span>
    </div>
  );
}