// src/pages/AdminPage.tsx
import { useState, useEffect } from "react";
import "../styles/admin.css";

interface Hero {
  id: number;
  name: string;
  description: string;
  price: number;
  stars: number;
  type: string;
  image?: string;
  stock?: number;
  poder?: number;
  vida?: number;
  defensa?: number;
  ataque?: string;
  damage?: string;
  efecto?: string;
  descuento?: number;
}

export default function AdminPage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [editingHero, setEditingHero] = useState<Hero | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string>("");
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    type: '',
    stock: '',
    image: null as File | null,
    poder: '',
    vida: '',
    defensa: '',
    ataque: '',
    damage: '',
    efecto: '',
    descuento: ''
  });

  // AdminPage.tsx - Modifica fetchHeroes
const fetchHeroes = async () => {
  setLoading(true);
  try {
    console.log('🟢 Admin: Cargando héroes...');
    const response = await fetch('http://localhost:3000/api/v1/heroes');
    const data = await response.json();
    console.log('📦 Admin: Datos recibidos:', data);
    
    if (data.success && data.heroes) {
      setHeroes(data.heroes);
    } else if (data.heroes && Array.isArray(data.heroes)) {
      setHeroes(data.heroes);
    } else if (Array.isArray(data)) {
      setHeroes(data);
    } else {
      console.warn('Formato no reconocido:', data);
      setHeroes([]);
    }
  } catch (error) {
    console.error('Error fetching heroes:', error);
    setHeroes([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchHeroes();
  }, []);

  const validatePrice = (value: string): boolean => {
    const numPrice = parseInt(value);
    if (numPrice > 999) {
      setPriceError("❌ El precio máximo permitido es 999 USD");
      return false;
    }
    if (numPrice < 0) {
      setPriceError("❌ El precio no puede ser negativo");
      return false;
    }
    setPriceError("");
    return true;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setFormData({ ...formData, price: value });
      if (value) validatePrice(value);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen debe ser menor a 2MB');
        return;
      }
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (hero: Hero) => {
    setEditingHero(hero);
    setFormData({
      name: hero.name,
      description: hero.description,
      price: hero.price.toString(),
      type: hero.type,
      stock: hero.stock?.toString() || '',
      image: null,
      poder: hero.poder?.toString() || '',
      vida: hero.vida?.toString() || '',
      defensa: hero.defensa?.toString() || '',
      ataque: hero.ataque || '',
      damage: hero.damage || '',
      efecto: hero.efecto || '',
      descuento: hero.descuento?.toString() || ''
    });
    setPreviewImage(hero.image || null);
    setPriceError("");
    setActiveTab('create');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const priceValue = parseInt(formData.price);
    if (priceValue > 999) {
      alert("❌ El precio no puede superar los 999 USD");
      return;
    }
    if (priceValue < 0) {
      alert("❌ El precio no puede ser negativo");
      return;
    }

    let imageUrl = editingHero?.image || '';
    
    if (formData.image) {
      const reader = new FileReader();
      imageUrl = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(formData.image);
      });
    }
    
    const heroData = {
      name: formData.name,
      description: formData.description,
      price: priceValue,
      stars: 3,
      type: formData.type,
      stock: parseInt(formData.stock) || 0,
      image: imageUrl,
      poder: parseInt(formData.poder) || 0,
      vida: parseInt(formData.vida) || 0,
      defensa: parseInt(formData.defensa) || 0,
      ataque: formData.ataque || '',
      damage: formData.damage || '',
      efecto: formData.efecto || '',
      descuento: parseInt(formData.descuento) || 0
    };
    
    try {
      let url = 'http://localhost:3000/api/v1/heroes';
      let method = 'POST';
      
      if (editingHero) {
        url = `http://localhost:3000/api/v1/heroes/${editingHero.id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert(editingHero 
          ? `✅ ¡${formData.name} ha sido actualizado!` 
          : `✅ ¡${formData.name} ha sido creado!`
        );
        await fetchHeroes();
        setFormData({ 
          name: '', 
          description: '', 
          price: '', 
          type: '', 
          stock: '',
          image: null,
          poder: '',
          vida: '',
          defensa: '',
          ataque: '',
          damage: '',
          efecto: '',
          descuento: ''
        });
        setPreviewImage(null);
        setEditingHero(null);
        setActiveTab('list');
      } else {
        alert(`❌ Error: ${data.error || data.message || 'No se pudo guardar'}`);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      alert('❌ Error de conexión con el servidor');
    }
  };

  const eliminarHero = async (id: number) => {
    if (confirm('¿Eliminar este héroe?')) {
      try {
        const response = await fetch(`http://localhost:3000/api/v1/heroes/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert('🗑️ Héroe eliminado');
          await fetchHeroes();
        } else {
          const data = await response.json();
          alert(`❌ Error: ${data.error || 'No se pudo eliminar'}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión');
      }
    }
  };

  const cancelEdit = () => {
    setEditingHero(null);
    setFormData({ 
      name: '', 
      description: '', 
      price: '', 
      type: '', 
      stock: '',
      image: null,
      poder: '',
      vida: '',
      defensa: '',
      ataque: '',
      damage: '',
      efecto: '',
      descuento: ''
    });
    setPreviewImage(null);
    setActiveTab('list');
    setPriceError("");
  };

  const totalHeroes = heroes.length;
  const avgStars = heroes.length > 0 
    ? (heroes.reduce((acc, h) => acc + h.stars, 0) / heroes.length).toFixed(1)
    : '0';
  const totalValue = heroes.reduce((acc, h) => acc + h.price, 0);

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">⚔️ PANEL DEL ADMINISTRADOR</h1>
          <p className="admin-subtitle">Control total sobre los héroes</p>
        </div>
        <button 
          className="create-btn"
          onClick={() => {
            setEditingHero(null);
            setFormData({ 
              name: '', 
              description: '', 
              price: '', 
              type: '', 
              stock: '',
              image: null,
              poder: '',
              vida: '',
              defensa: '',
              ataque: '',
              damage: '',
              efecto: '',
              descuento: ''
            });
            setPreviewImage(null);
            setPriceError("");
            setActiveTab(activeTab === 'create' ? 'list' : 'create');
          }}
        >
          {activeTab === 'create' ? '← VOLVER A LISTA' : '+ AGREGAR NUEVO HÉROE'}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⚔️</div>
          <div className="stat-info">
            <span className="stat-value">{totalHeroes}</span>
            <span className="stat-label">Héroes Registrados</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <span className="stat-value">{avgStars}</span>
            <span className="stat-label">Promedio Estrellas</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <span className="stat-value">{totalValue} USD</span>
            <span className="stat-label">Valor Total</span>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {activeTab === 'create' ? (
          <div className="create-section">
            <h2 className="section-title">
              {editingHero ? '✏️ EDITAR HÉROE' : '✨ CREAR NUEVO HÉROE'}
            </h2>
            <form onSubmit={handleSubmit} className="hero-form">
              <div className="form-grid">
                <div className="form-field">
                  <label>NOMBRE DEL HÉROE *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej: Warrior Tanque"
                    required
                  />
                </div>
                
                <div className="form-field">
                  <label>TIPO *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Guerrero">⚔️ Guerrero</option>
                    <option value="Mago">🔮 Mago</option>
                    <option value="Arquero">🏹 Arquero</option>
                    <option value="Tanque">🛡️ Tanque</option>
                    <option value="Asesino">🗡️ Asesino</option>
                  </select>
                </div>

                <div className="form-field full-width">
                  <label>DESCRIPCIÓN *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Historia y características del héroe..."
                    rows={3}
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label style={{ color: '#C8860A', borderBottom: '1px solid #C8860A', marginBottom: '0.5rem' }}>
                    ⚔️ ESTADÍSTICAS DE COMBATE
                  </label>
                </div>

                <div className="form-field">
                  <label>💪 PODER</label>
                  <input
                    type="number"
                    value={formData.poder}
                    onChange={(e) => setFormData({...formData, poder: e.target.value})}
                    placeholder="Ej: 1"
                    min="0"
                  />
                </div>

                <div className="form-field">
                  <label>❤️ VIDA</label>
                  <input
                    type="number"
                    value={formData.vida}
                    onChange={(e) => setFormData({...formData, vida: e.target.value})}
                    placeholder="Ej: 24"
                    min="0"
                  />
                </div>

                <div className="form-field">
                  <label>🛡️ DEFENSA</label>
                  <input
                    type="number"
                    value={formData.defensa}
                    onChange={(e) => setFormData({...formData, defensa: e.target.value})}
                    placeholder="Ej: 11"
                    min="0"
                  />
                </div>

                <div className="form-field">
                  <label>⚔️ ATAQUE</label>
                  <input
                    type="text"
                    value={formData.ataque}
                    onChange={(e) => setFormData({...formData, ataque: e.target.value})}
                    placeholder="Ej: 10 + 1d6"
                  />
                </div>

                <div className="form-field">
                  <label>🎲 DAÑO</label>
                  <input
                    type="text"
                    value={formData.damage}
                    onChange={(e) => setFormData({...formData, damage: e.target.value})}
                    placeholder="Ej: 1d4"
                  />
                </div>

                <div className="form-field">
                  <label>✨ EFECTO ESPECIAL</label>
                  <input
                    type="text"
                    value={formData.efecto}
                    onChange={(e) => setFormData({...formData, efecto: e.target.value})}
                    placeholder="Ej: -1 de poder al oponente"
                  />
                </div>

                <div className="form-field">
                  <label>🏷️ DESCUENTO (%)</label>
                  <input
                    type="number"
                    value={formData.descuento}
                    onChange={(e) => setFormData({...formData, descuento: e.target.value})}
                    min="0"
                    max="100"
                    placeholder="Ej: 30"
                  />
                </div>

                <div className="form-field full-width">
                  <label style={{ color: '#C8860A', borderBottom: '1px solid #C8860A', marginBottom: '0.5rem' }}>
                    💰 PRECIO Y STOCK
                  </label>
                </div>

                <div className="form-field">
                  <label>PRECIO (USD) *</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={handlePriceChange}
                    placeholder="0 - 999 USD"
                    required
                  />
                  <div style={{ fontSize: '0.7rem', color: '#B89A6A', marginTop: '0.2rem' }}>
                    💵 Máximo 999 USD
                  </div>
                  {priceError && (
                    <div style={{ fontSize: '0.7rem', color: '#FF8A8A', marginTop: '0.2rem' }}>
                      {priceError}
                    </div>
                  )}
                </div>

                <div className="form-field">
                  <label>📦 STOCK</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    min="0"
                    placeholder="Cantidad disponible"
                  />
                  <div style={{ fontSize: '0.7rem', color: '#B89A6A', marginTop: '0.2rem' }}>
                    Unidades disponibles para la venta
                  </div>
                </div>

                <div className="form-field full-width">
                  <label>IMAGEN DEL HÉROE</label>
                  <div className="image-upload-area">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      id="hero-image"
                      className="image-input-hidden"
                    />
                    <label htmlFor="hero-image" className="image-upload-label">
                      📷 {formData.image ? formData.image.name : (editingHero ? 'Cambiar imagen' : 'Seleccionar imagen')}
                    </label>
                    
                    {previewImage && (
                      <div className="image-preview">
                        <img src={previewImage} alt="Preview" />
                        <button 
                          type="button"
                          className="remove-image"
                          onClick={() => {
                            setFormData({...formData, image: null});
                            setPreviewImage(null);
                          }}
                        >
                          ✖
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={cancelEdit} className="btn-cancel">
                  CANCELAR
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={!!priceError || (parseInt(formData.price) > 999)}
                >
                  {editingHero ? '💾 ACTUALIZAR HÉROE' : '💾 GUARDAR HÉROE'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="list-section">
            <div className="list-header">
              <h2 className="section-title">📋 LISTA DE HÉROES ({heroes.length})</h2>
            </div>

            <div className="heroes-table-wrapper">
              {loading ? (
                <div className="loading-state">Cargando héroes...</div>
              ) : (
                <table className="heroes-table">
                  <thead>
                    <tr>
                      <th>IMAGEN</th>
                      <th>NOMBRE</th>
                      <th>DESCRIPCIÓN</th>
                      <th>ESTADÍSTICAS</th>
                      <th>PRECIO</th>
                      <th>STOCK</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {heroes.map((hero) => (
                      <tr key={hero.id}>
                        <td className="image-cell">
                          {hero.image ? (
                            <img src={hero.image} alt={hero.name} className="hero-avatar" />
                          ) : (
                            <div className="hero-avatar-placeholder">⚔️</div>
                          )}
                        </td>
                        <td className="hero-name">{hero.name}</td>
                        <td className="hero-description">{hero.description?.substring(0, 50)}...</td>
                        <td className="stats-cell" style={{ fontSize: '0.7rem' }}>
                          💪{hero.poder || 0} ❤️{hero.vida || 0} 🛡️{hero.defensa || 0}<br />
                          ⚔️{hero.ataque || '-'} 🎲{hero.damage || '-'}
                          {hero.descuento ? <span className="discount-tag"> -{hero.descuento}%</span> : null}
                          {hero.efecto && <div className="effect-tag">✨ {hero.efecto?.substring(0, 30)}...</div>}
                        </td>
                        <td className="price">${hero.price} USD</td>
                        <td className="stock-cell">{hero.stock || 0}</td>
                        <td className="actions">
                          <button className="action-edit" onClick={() => handleEdit(hero)}>✏️</button>
                          <button className="action-delete" onClick={() => eliminarHero(hero.id)}>🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {!loading && heroes.length === 0 && (
                <div className="empty-state">
                  <p>No hay héroes creados aún</p>
                  <button onClick={() => setActiveTab('create')} className="btn-submit">
                    CREAR PRIMER HÉROE
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .stats-cell {
          max-width: 200px;
        }
        
        .stock-cell {
          text-align: center;
          font-weight: bold;
          color: #30B8E8;
        }
        
        .discount-tag {
          display: inline-block;
          background: #D42030;
          color: white;
          padding: 0.1rem 0.3rem;
          border-radius: 4px;
          font-size: 0.6rem;
          margin-left: 0.3rem;
        }
        
        .effect-tag {
          font-size: 0.6rem;
          color: #B06EFF;
          margin-top: 0.2rem;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}