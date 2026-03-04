import InventoryCard from "../InventoryCard/InventoryCard";
import "./InventoryGrid.css";

export default function InventoryGrid({ items, isLoading, isError }) {
  if (isLoading) {
    return <div className="inv-grid__state">Cargando inventario…</div>;
  }

  //  Si hay error, mostramos aviso PERO también mostramos el grid si hay items
  return (
    <>
      {isError && (
        <div className="inv-grid__state inv-grid__state--err">
          No se pudo cargar del servidor. Mostrando datos de prueba.
        </div>
      )}

      {!items?.length ? (
        <div className="inv-grid__state">No tienes ítems en tu inventario.</div>
      ) : (
        <div className="inv-grid" role="list">
          {items.map((item) => (
            <div key={item.id} role="listitem">
              <InventoryCard item={item} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}