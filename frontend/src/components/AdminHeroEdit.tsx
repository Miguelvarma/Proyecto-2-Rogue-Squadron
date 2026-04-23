// src/components/AdminHeroEdit.tsx
import { useState } from "react";

interface Hero {
  id: string;
  name: string;
  power: string;
  level: number;
  description?: string;
}

interface AdminHeroEditProps {
  hero: Hero;
  onClose: () => void;
  onHeroActualizado: () => void;
}

export default function AdminHeroEdit({ hero, onClose, onHeroActualizado }: AdminHeroEditProps) {
  const [formData, setFormData] = useState({
    name: hero.name,
    power: hero.power,
    level: hero.level,
    description: hero.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:3000/api/v1/heroes/${hero.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert(`✅ ${formData.name} ha sido actualizado`);
        onHeroActualizado();
      } else {
        alert('❌ Error al actualizar el héroe');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión al actualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Héroe</h2>
          <button className="modal-close" onClick={onClose}>✖</button>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-edit-form">
          <div className="form-group">
            <label>Nombre del Héroe</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Poder</label>
            <input
              type="text"
              value={formData.power}
              onChange={(e) => setFormData({...formData, power: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Nivel (1-100)</label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.level}
              onChange={(e) => setFormData({...formData, level: parseInt(e.target.value)})}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Descripción (opcional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-save">
              {loading ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}