import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryApi, Item, Filters } from '@/api/inventory';
import { getErrorMessage } from '@/api/client';
import Pagination from '@/components/Pagination';
import './InventoryPage.css';

export default function InventoryPage() {
  const navigate = useNavigate();
  
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedRareza, setSelectedRareza] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchInventory = useCallback(async () => {
  setLoading(true);
  setError(null);
  
  try {
    const filters: Filters = {
      page: currentPage,
      limit: 16
    };
    
    if (selectedTipo) filters.tipo = selectedTipo;
    if (selectedRareza) filters.rareza = selectedRareza;
    
    const response = await inventoryApi.getItems(filters);
    console.log('📦 Respuesta del backend:', response); // 👈 VERIFICAR
    console.log('Total items:', response.total); // 👈 DEBERÍA SER 40
    console.log('📊 totalPages:', totalPages, 'totalPages > 1?', totalPages > 1);
    
    setItems(response.items);
    setTotalPages(response.totalPages);
    setTotalItems(response.total);
  } catch (err) {
    setError(getErrorMessage(err));
  } finally {
    setLoading(false);
  }
}, [currentPage, selectedTipo, selectedRareza]);

  const handleSearch = useCallback(async (query: string) => {
    if (query.length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (query.length < 4) return;

    try {
      const response = await inventoryApi.searchItems(query);
      setSearchResults(response.results);
      setIsSearching(true);
    } catch (err) {
      console.error('Error en búsqueda:', err);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery) handleSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    if (!isSearching) fetchInventory();
  }, [fetchInventory, isSearching]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const displayItems = isSearching ? searchResults : items;

  const getRarityColor = (rareza: string) => {
    switch (rareza) {
      case 'Legendaria': return 'var(--rarity-legendary)';
      case 'Épica': return 'var(--rarity-epic)';
      case 'Rara': return 'var(--rarity-rare)';
      case 'Común': return 'var(--rarity-common)';
      default: return 'var(--color-rune-gray)';
    }
  };

  const getTypeEmoji = (tipo: string) => {
    switch (tipo) {
      case 'Arma': return '⚔️';
      case 'Armadura': return '🛡️';
      case 'Héroe': return '🧙';
      case 'Habilidad': return '🔮';
      case 'Ítem': return '📜';
      case 'Épica': return '👑';
      default: return '❓';
    }
  };

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <h1 className="inventory-title">🎒 MI INVENTARIO</h1>
        <p className="inventory-subtitle">
          {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'} en tu colección
        </p>
      </header>

      <div className="filters-section">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar ítems... (mínimo 4 caracteres)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSearching && (
            <button className="clear-search" onClick={clearSearch}>
              ✕ Limpiar búsqueda
            </button>
          )}
        </div>

        <select
          className="filter-select"
          value={selectedTipo}
          onChange={(e) => { setSelectedTipo(e.target.value); setCurrentPage(1); }}
          disabled={isSearching}
        >
          <option value="">TODOS LOS TIPOS</option>
          <option value="Héroe">HÉROE</option>
          <option value="Arma">ARMA</option>
          <option value="Armadura">ARMADURA</option>
          <option value="Habilidad">HABILIDAD</option>
          <option value="Ítem">ÍTEM</option>
          <option value="Épica">ÉPICA</option>
        </select>

        <select
          className="filter-select"
          value={selectedRareza}
          onChange={(e) => { setSelectedRareza(e.target.value); setCurrentPage(1); }}
          disabled={isSearching}
        >
          <option value="">TODAS LAS RAREZAS</option>
          <option value="Común">COMÚN</option>
          <option value="Rara">RARA</option>
          <option value="Épica">ÉPICA</option>
          <option value="Legendaria">LEGENDARIA</option>
        </select>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>CARGANDO INVENTARIO...</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-state">⚠️ {error}</div>
      )}

      {!loading && !error && (
        <>
          {displayItems.length === 0 ? (
            <div className="empty-state">
              {isSearching
                ? `No se encontraron resultados para "${searchQuery}"`
                : 'Tu inventario está vacío'}
            </div>
          ) : (
            <>
              <div className="items-grid">
                {displayItems.map((item) => (
                  <div
                    key={item.id}
                    className="item-card"
                    onClick={() => navigate(`/inventory/${item.id}`)}
                    style={{
                      borderColor: getRarityColor(item.rareza),
                      boxShadow: `0 0 15px ${getRarityColor(item.rareza)}33`
                    }}
                  >
                    <div className="item-card__image">
                      {item.imagen && !item.imagen.includes('example') ? (
                        <img src={item.imagen} alt={item.nombre} />
                      ) : (
                        <span className="item-emoji">{getTypeEmoji(item.tipo)}</span>
                      )}
                    </div>

                    <div className="item-card__badge" style={{
                      background: `${getRarityColor(item.rareza)}33`,
                      borderColor: getRarityColor(item.rareza),
                      color: getRarityColor(item.rareza)
                    }}>
                      {item.rareza}
                    </div>

                    <h3 className="item-card__name">{item.nombre}</h3>
                    <p className="item-card__type">{item.tipo}</p>

                    <div className="item-card__stats">
                      <div className="stat">
                        <span className="stat-label">ATQ</span>
                        <span className="stat-value" style={{ color: 'var(--color-crimson-bright)' }}>
                          {item.ataque}
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">DEF</span>
                        <span className="stat-value" style={{ color: 'var(--color-ice-bright)' }}>
                          {item.defensa}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!isSearching && totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}