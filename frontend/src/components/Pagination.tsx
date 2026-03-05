import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
      }
    }
    return pages;
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) onPageChange(page);
  };

  const goPrevWindow = () => goToPage(Math.max(1, currentPage - 5));
  const goNextWindow = () => goToPage(Math.min(totalPages, currentPage + 5));

  return (
    <div className="pagination">
      <button
        className="pagination__arrow"
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        title="Primera página"
      >
        ««
      </button>
      <button
        className="pagination__arrow"
        onClick={goPrevWindow}
        disabled={currentPage <= 5}
        title="5 páginas atrás"
      >
        «
      </button>

      <button
        className="pagination__btn"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Anterior
      </button>

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

      <button
        className="pagination__btn"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </button>

      <button
        className="pagination__arrow"
        onClick={goNextWindow}
        disabled={currentPage > totalPages - 5}
        title="5 páginas adelante"
      >
        »
      </button>
      <button
        className="pagination__arrow"
        onClick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        title="Última página"
      >
        »»
      </button>
    </div>
  );
}