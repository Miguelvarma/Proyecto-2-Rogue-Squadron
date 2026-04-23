// src/components/AdminHeroesList.tsx
import { useState } from "react";
import AdminHeroEdit from "./AdminHeroEdit";

interface Hero {
  id: string;
  name: string;
  power: string;
  level: number;
  description?: string;
  createdAt?: string;
}

interface AdminHeroesListProps {
  heroes: Hero[];
  onHeroEliminado: () => void;
  onHeroActualizado: () => void;
}

export default function AdminHeroesList({ 
  heroes, 
  onHeroEliminado, 
  onHeroActualizado 
}: AdminHeroesListProps) {
  const [heroEditando, setHeroEditando] = useState<Hero | null>(null);

  const eliminarHero = async (id: string, nombre: string) => {
    if (confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/heroes/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          alert(`✅ ${nombre} ha sido eliminado`);
          onHeroEliminado();
        } else {
          alert('❌ Error al eliminar el héroe');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión al eliminar');
      }
    }
  };

  if (heroes.length === 0) {
    return (
      <div className="admin-heroes-list">
        <div className="empty-state">
          <div className="empty-icon">🏰</div>
          <h3>No hay héroes creados</h3>
          <p>Comienza agregando tu primer héroe usando el botón superior</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-heroes-list">
      <h2 className="list-title">📜 Héroes Creados ({heroes.length})</h2>
      
      <div className="heroes-grid">
        {heroes.map((hero) => (
          <div key={hero.id} className="hero-admin-card">
            <div className="hero-card-header">
              <div className="hero-icon">⚔️</div>
              <div className="hero-level">Nivel {hero.level}</div>
            </div>
            
            <div className="hero-card-body">
              <h3 className="hero-name">{hero.name}</h3>
              <div className="hero-power">
                <span className="power-label">Poder:</span>
                <span className="power-value">{hero.power}</span>
              </div>
              {hero.description && (
                <p className="hero-description">{hero.description}</p>
              )}
              {hero.createdAt && (
                <p className="hero-date">
                  Creado: {new Date(hero.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
            
            <div className="hero-card-actions">
              <button 
                className="btn-edit"
                onClick={() => setHeroEditando(hero)}
              >
                ✏️ Editar
              </button>
              <button 
                className="btn-delete"
                onClick={() => eliminarHero(hero.id, hero.name)}
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edición */}
      {heroEditando && (
        <AdminHeroEdit 
          hero={heroEditando}
          onClose={() => setHeroEditando(null)}
          onHeroActualizado={() => {
            setHeroEditando(null);
            onHeroActualizado();
          }}
        />
      )}
    </div>
  );
}