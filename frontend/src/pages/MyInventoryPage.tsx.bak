import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { inventoryApi, Item, Filters } from '@/api/inventory';
import { getErrorMessage } from '@/api/client';
import Pagination from '@/components/Pagination';
import './InventoryPage.css';

export default function MyInventoryPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedRareza, setSelectedRareza] = useState('');

  // 🔧 CRÍTICO: Verificar si el usuario es ADMIN para crear items
  const userRol = (user as any)?.rol;
  const canCreate = userRol === 'ADMIN';

  const fetchMyInventory = useCallback(async () => {
    console.log('🔄 [MyInventoryPage] fetchMyInventory iniciando...');
    setLoading(true);
    setError(null);
    
    // Crear promise con timeout
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: La solicitud tardó demasiado')), 10000)
    );
    
    try {
      const filters: Filters = { page: currentPage, limit: 16 };
      if (selectedTipo) filters.tipo = selectedTipo;
      if (selectedRareza) filters.rareza = selectedRareza;

      console.log('📤 [MyInventoryPage] Llamando a getMyItems con filters:', filters);
      
      // Race entre fetch y timeout
      const response = await Promise.race([
        inventoryApi.getMyItems(filters),
        timeoutPromise
      ]);
      
      console.log('✅ [MyInventoryPage] Respuesta recibida:', response);
      console.log('📊 Items:', response.items?.length, 'Total:', response.total, 'TotalPages:', response.totalPages);
      
      if (!response || !response.items) {
        throw new Error('Respuesta inválida del servidor - fallaN items');
      }
      
      setItems(response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.total || 0);
      console.log('✅ [MyInventoryPage] Estado actualizado correctamente');
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      console.error('❌ [MyInventoryPage] Error en fetch:', err);
      console.error('❌ [MyInventoryPage] Error formateado:', errorMsg);
      setError(errorMsg);
      // Debug extra
      if (err instanceof Error) {
        console.error('❌ [MyInventoryPage] Stack:', err.stack);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedTipo, selectedRareza]);

  useEffect(() => { 
    console.log('🎯 [MyInventoryPage] useEffect ejecutado, llamando fetchMyInventory');
    fetchMyInventory(); 
  }, [fetchMyInventory]);

  const getRarityColor = (rareza: string) => {
    switch (rareza) {
      case 'Legendaria': return 'var(--rarity-legendary)';
      case 'Épica': return 'var(--rarity-epic)';
      case 'Rara': return 'var(--rarity-rare)';
      default: return 'var(--rarity-common)';
    }
  };

  const getTypeEmoji = (tipo: string) => {
    const map: Record<string, string> = {
      Arma: '⚔️', Armadura: '🛡️', Héroe: '🧙', Habilidad: '🔮', Ítem: '📜', Épica: '👑',
    };
    return map[tipo] ?? '❓';
  };

  return (
    <div className="inventory-page">
      <header className="inventory-header">
        <h1 className="inventory-title">🎒 MI INVENTARIO</h1>
        <p className="inventory-subtitle">
          {totalItems} {totalItems === 1 ? 'ítem' : 'ítems'} en tu colección
        </p>
      </header>

      {/* DEBUG: Mostrar estado para debuguear */}
      <div style={{ 
        fontSize: '0.8rem', 
        color: '#888', 
        marginBottom: '1rem', 
        padding: '0.5rem', 
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '4px',
        fontFamily: 'monospace'
      }}>
        [DEBUG] Loading: {loading ? 'true' : 'false'} | Error: {error ? 'YES' : 'NO'} | Items: {items.length} | Page: {currentPage}/{totalPages}
      </div>

      <div className="filters-section">
        <select
          className="filter-select"
          value={selectedTipo}
          onChange={(e) => { setSelectedTipo(e.target.value); setCurrentPage(1); }}
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
          <p>CARGANDO TU INVENTARIO...</p>
          <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Por favor espera...</p>
        </div>
      )}

      {error && !loading && (
        <div className="error-state" style={{ 
          borderColor: '#ff6666', 
          background: 'rgba(255, 102, 102, 0.15)',
        }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>⚠️ ERROR</div>
          <div style={{ wordBreak: 'break-word', textAlign: 'left' }}>{error}</div>
          <div style={{ fontSize: '0.8rem', marginTop: '1rem', opacity: 0.7 }}>
            Abre la consola (F12) para ver más detalles en el log
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {items.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎒</div>
              <div>No tienes ítems en tu inventario aún.</div>
              {/* 🔧 CRÍTICO: Mostrar botón crear solo si es ADMIN */}
              {canCreate && (
                <button 
                  onClick={() => navigate('/create-item')}
                  style={{
                    marginTop: '1rem',
                    padding: '0.6rem 1.2rem',
                    background: 'var(--color-gold)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ✨ Crear mi primer ítem
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="items-grid">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="item-card"
                    onClick={() => navigate(`/inventory/${item.id}`)}
                    style={{
                      borderColor: getRarityColor(item.rareza),
                      boxShadow: `0 0 15px ${getRarityColor(item.rareza)}33`,
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
                      color: getRarityColor(item.rareza),
                    }}>
                      {item.rareza}
                    </div>
                    <h3 className="item-card__name">{item.nombre}</h3>
                    <p className="item-card__type">{item.tipo}</p>
                    <div className="item-card__stats">
                      <div className="stat">
                        <span className="stat-label">ATQ</span>
                        <span className="stat-value" style={{ color: 'var(--color-crimson-bright)' }}>{item.ataque}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">DEF</span>
                        <span className="stat-value" style={{ color: 'var(--color-ice-bright)' }}>{item.defensa}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
