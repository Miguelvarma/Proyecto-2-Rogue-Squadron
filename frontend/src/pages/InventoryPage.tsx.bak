// src/pages/InventoryPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryApi, PurchasedItem } from '@/api/inventory';
import './InventoryPage.css';

export default function InventoryPage() {
  const navigate = useNavigate();
  
  const [items, setItems] = useState<PurchasedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedRareza, setSelectedRareza] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PurchasedItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // ✅ Cargar items comprados
  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await inventoryApi.getPurchasedItems();
      console.log('📦 Items comprados:', response);
      
      if (response.success) {
        let filteredItems = response.data || [];
        
        // Filtrar por tipo
        if (selectedTipo) {
          filteredItems = filteredItems.filter((item) => 
            item.metadata?.type === selectedTipo
          );
        }
        
        // Filtrar por rareza
        if (selectedRareza) {
          filteredItems = filteredItems.filter((item) => 
            item.rarity === selectedRareza.toUpperCase()
          );
        }

        setItems(filteredItems);
        setTotalItems(filteredItems.length);
        setTotalPages(Math.ceil(filteredItems.length / 16));
      } else {
        setError('Error al cargar inventario');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }, [selectedTipo, selectedRareza]);

  const handleSearch = useCallback(async (query: string) => {
    if (query.length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    if (query.length < 4) return;

    try {
      const response = await inventoryApi.getPurchasedItems();
      
      if (response.success) {
        const filtered = response.data.filter((item: PurchasedItem) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
        setIsSearching(true);
      }
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

  // Recargar cuando la página gana foco
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Página enfocada, recargando inventario...');
      fetchInventory();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchInventory]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const displayItems = isSearching ? searchResults : items;

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toUpperCase()) {
      case 'LEGENDARY': return '#F5C842';
      case 'EPIC': return '#B06EFF';
      case 'RARE': return '#30B8E8';
      case 'COMMON': return '#9E9E9E';
      default: return '#7A6A58';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity?.toUpperCase()) {
      case 'LEGENDARY': return 'Legendario';
      case 'EPIC': return 'Épico';
      case 'RARE': return 'Raro';
      case 'COMMON': return 'Común';
      default: return rarity;
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'WEAPON': return '⚔️';
      case 'ARMOR': return '🛡️';
      case 'POTION': return '🧪';
      case 'ARTIFACT': return '🐉';
      case 'HERO': return '🧙';
      default: return '📦';
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>CARGANDO INVENTARIO...</p>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="error-state">
        <p>⚠️ {error}</p>
        <button onClick={() => fetchInventory()} className="retry-btn">Reintentar</button>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <h1 className="inventory-title">🎒 INVENTARIO</h1>
        <p className="inventory-subtitle">
          {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'} adquiridos
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
          <option value="WEAPON">ARMA</option>
          <option value="ARMOR">ARMADURA</option>
          <option value="POTION">POCIÓN</option>
          <option value="ARTIFACT">ARTEFACTO</option>
          <option value="HERO">HÉROE</option>
        </select>

        <select
          className="filter-select"
          value={selectedRareza}
          onChange={(e) => { setSelectedRareza(e.target.value); setCurrentPage(1); }}
          disabled={isSearching}
        >
          <option value="">TODAS LAS RAREZAS</option>
          <option value="COMMON">COMÚN</option>
          <option value="RARE">RARA</option>
          <option value="EPIC">ÉPICA</option>
          <option value="LEGENDARY">LEGENDARIA</option>
        </select>
      </div>

      {!loading && !error && (
        <>
          {displayItems.length === 0 ? (
            <div className="empty-state">
              {isSearching
                ? `No se encontraron resultados para "${searchQuery}"`
                : 'Tu inventario está vacío. Compra items en la tienda'}
            </div>
          ) : (
            <>
              <div className="items-grid">
                {displayItems.map((item) => (
                  <div
                    key={item.id}
                    className="item-card"
                    style={{
                      borderColor: getRarityColor(item.rarity),
                      boxShadow: `0 0 15px ${getRarityColor(item.rarity)}33`
                    }}
                  >
                    <div className="item-card__image">
                      <span className="item-emoji">{getTypeEmoji(item.metadata?.type)}</span>
                    </div>

                    <div className="item-card__badge" style={{
                      background: `${getRarityColor(item.rarity)}33`,
                      borderColor: getRarityColor(item.rarity),
                      color: getRarityColor(item.rarity)
                    }}>
                      {getRarityLabel(item.rarity)}
                    </div>

                    <h3 className="item-card__name">{item.name}</h3>
                    <p className="item-card__type">{item.metadata?.type || 'ITEM'}</p>

                    {item.metadata?.price && (
                      <div className="item-card__price">${item.metadata.price} USD</div>
                    )}

                    <div className="item-card__date">
                      Adquirido: {new Date(item.acquired_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>

              {!isSearching && totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Anterior
                  </button>
                  <span>Página {currentPage} de {totalPages}</span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <style>{`
        .pagination {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 2rem;
          padding: 1rem;
        }
        
        .pagination button {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #C8860A, #8B5E00);
          border: none;
          border-radius: 8px;
          color: #0A0705;
          cursor: pointer;
          font-weight: bold;
        }
        
        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pagination span {
          color: #F5C842;
          display: flex;
          align-items: center;
        }
        
        .retry-btn {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #C8860A, #8B5E00);
          border: none;
          border-radius: 8px;
          color: #0A0705;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}