import { useInventory } from "../hooks/useInventory";
import InventoryGrid from "../components/InventoryGrid/InventoryGrid";
import Pagination from "../components/Pagination/Pagination";
import "./InventoryPage.css";

export default function InventoryPage() {
  const {
    pageItems,
    isLoading,
    isError,
    page,
    totalPages,
    totalItems,
    goToPage,
  } = useInventory();

  return (
    <div className="inv-page">
      <header className="inv-page__header">
        <div>
          <div className="inv-page__subtitle">MI INVENTARIO</div>
          <h1 className="inv-page__title">Colección de Ítems</h1>
        </div>

        <div className="inv-page__count">
          Total: <strong>{totalItems}</strong> ítems
        </div>
      </header>

      <InventoryGrid
        items={pageItems}  
        isLoading={isLoading}
        isError={isError}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={goToPage}
      />
    </div>
  );
}