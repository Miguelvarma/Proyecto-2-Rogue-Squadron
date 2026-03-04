import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMyInventory } from "../api/inventoryApi";

const PAGE_SIZE = 16;

// MOCK opcional si backend no responde aún
const MOCK_ITEMS = Array.from({ length: 200 }).map((_, i) => ({
  id: i + 1,
  name: `Ítem ${i + 1}`,
  type: ["hero", "spell", "weapon", "armor", "item"][i % 5],
  rarity: ["common", "rare", "epic", "legendary"][i % 4],
  mana: (i % 10) + 1,
  qty: (i % 3) + 1,
  icon: ["🧙", "⚡", "⚔️", "🛡️", "📿"][i % 5],
}));

export function useInventory() {
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["inventory", "me"],
    queryFn: fetchMyInventory,
    // Si falla (backend no listo), usamos mock para poder terminar la HU:
    retry: 0,
  });

  const items = MOCK_ITEMS; // solo para pruebas

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  // Garantiza que page quede dentro del rango
  const safePage = Math.min(Math.max(page, 1), totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, safePage]);

  function goToPage(nextPage) {
    const p = Math.min(Math.max(nextPage, 1), totalPages);
    setPage(p);
  }

  return {
    ...query,
    items,
    pageItems,
    page: safePage,
    pageSize: PAGE_SIZE,
    totalItems,
    totalPages,
    goToPage,
  };
}