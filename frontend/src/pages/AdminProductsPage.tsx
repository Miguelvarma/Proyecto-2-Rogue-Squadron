// src/pages/AdminProductsPage.tsx (versión sin estrellas, emojis y héroes)
import { useState, useEffect } from "react";
import "../styles/admin.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  type: string;
  image?: string;
  category: 'weapon' | 'armor' | 'potion' | 'artifact';
  poder?: number;
  vida?: number;
  defensa?: number;
  ataque?: string;
  damage?: string;
  descuento?: number;
  efecto?: string;
}

const RARITIES = [
  { value: 'COMMON', label: 'Común', color: '#9E9E9E' },
  { value: 'RARE', label: 'Raro', color: '#30B8E8' },
  { value: 'EPIC', label: 'Épico', color: '#B06EFF' },
  { value: 'LEGENDARY', label: 'Legendario', color: '#F5C842' }
];

const CATEGORIES = [
  { value: 'weapon', label: '🗡️ Arma', icon: '🗡️' },
  { value: 'armor', label: '🛡️ Armadura', icon: '🛡️' },
  { value: 'potion', label: '🧪 Poción', icon: '🧪' },
  { value: 'artifact', label: '🐉 Artefacto', icon: '🐉' }
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    rarity: 'EPIC',
    type: 'WEAPON',
    category: 'weapon' as 'weapon' | 'armor' | 'potion' | 'artifact',
    image: null as File | null,
    poder: '',
    vida: '',
    defensa: '',
    ataque: '',
    damage: '',
    descuento: '',
    efecto: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/v1/products');
      const data = await response.json();
      if (data.success && data.products) {
        // Filtrar para excluir héroes (por si acaso)
        const filteredProducts = data.products.filter((p: Product) => 
          p.category !== 'hero' && p.category !== 'spell'
        );
        setProducts(filteredProducts);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      rarity: product.rarity,
      type: product.type,
      category: product.category,
      image: null,
      poder: product.poder?.toString() || '',
      vida: product.vida?.toString() || '',
      defensa: product.defensa?.toString() || '',
      ataque: product.ataque || '',
      damage: product.damage || '',
      descuento: product.descuento?.toString() || '',
      efecto: product.efecto || ''
    });
    setPreviewImage(product.image || null);
    setActiveTab('create');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = editingProduct?.image || '';
    
    if (formData.image) {
      const reader = new FileReader();
      imageUrl = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(formData.image);
      });
    }
    
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock) || 0,
      rarity: formData.rarity,
      type: formData.type,
      category: formData.category,
      image: imageUrl,
      poder: parseInt(formData.poder) || 0,
      vida: parseInt(formData.vida) || 0,
      defensa: parseInt(formData.defensa) || 0,
      ataque: formData.ataque || '',
      damage: formData.damage || '',
      descuento: parseInt(formData.descuento) || 0,
      efecto: formData.efecto || ''
    };
    
    try {
      let url = 'http://localhost:3000/api/v1/products';
      let method = 'POST';
      
      if (editingProduct) {
        url = `http://localhost:3000/api/v1/products/${editingProduct.id}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      if (response.ok) {
        alert(editingProduct 
          ? `✅ ${formData.name} actualizado exitosamente` 
          : `✅ ${formData.name} creado exitosamente`);
        await fetchProducts();
        resetForm();
      } else {
        alert('❌ Error al guardar producto');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      rarity: 'EPIC',
      type: 'WEAPON',
      category: 'weapon',
      image: null,
      poder: '',
      vida: '',
      defensa: '',
      ataque: '',
      damage: '',
      descuento: '',
      efecto: ''
    });
    setPreviewImage(null);
    setEditingProduct(null);
    setActiveTab('list');
  };

  const eliminarProducto = async (id: number) => {
    if (confirm('¿Eliminar este producto?')) {
      try {
        await fetch(`http://localhost:3000/api/v1/products/${id}`, {
          method: 'DELETE'
        });
        alert('🗑️ Producto eliminado');
        await fetchProducts();
      } catch (error) {
        alert('❌ Error al eliminar');
      }
    }
  };

  const getRarityInfo = (rarity: string) => {
    return RARITIES.find(r => r.value === rarity) || RARITIES[0];
  };

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category);
    return cat ? cat.icon : '📦';
  };

  const getStatsDisplay = (product: Product) => {
    if (product.category === 'weapon') {
      return `💪${product.poder || 0} ⚔️${product.ataque || '-'} 🎲${product.damage || '-'}`;
    }
    if (product.category === 'armor') {
      return `❤️${product.vida || 0} 🛡️${product.defensa || 0}`;
    }
    if (product.category === 'potion') {
      return `🧪 ${product.efecto?.substring(0, 30) || 'Sin efecto'}...`;
    }
    if (product.category === 'artifact') {
      return `💪${product.poder || 0} ✨${product.efecto?.substring(0, 30) || 'Sin efecto'}...`;
    }
    return '';
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">🏆 PANEL DE PRODUCTOS</h1>
          <p className="admin-subtitle">Gestiona armas, armaduras, pociones y artefactos</p>
        </div>
        <button 
          className="create-btn"
          onClick={() => {
            setEditingProduct(null);
            resetForm();
            setActiveTab(activeTab === 'create' ? 'list' : 'create');
          }}
        >
          {activeTab === 'create' ? '← VOLVER A LISTA' : '+ NUEVO PRODUCTO'}
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'create' ? (
          <div className="create-section">
            <h2 className="section-title">
              {editingProduct ? '✏️ EDITAR PRODUCTO' : '✨ CREAR NUEVO PRODUCTO'}
            </h2>
            <form onSubmit={handleSubmit} className="hero-form">
              <div className="form-grid">
                <div className="form-field">
                  <label>NOMBRE *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>CATEGORÍA</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>RAREZA</label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({...formData, rarity: e.target.value as any})}
                  >
                    {RARITIES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-field full-width">
                  <label>DESCRIPCIÓN *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    required
                  />
                </div>

                {/* Stats según categoría */}
                {(formData.category === 'weapon' || formData.category === 'artifact') && (
                  <>
                    <div className="form-field">
                      <label>PODER</label>
                      <input type="number" value={formData.poder} onChange={(e) => setFormData({...formData, poder: e.target.value})} />
                    </div>
                    <div className="form-field">
                      <label>ATAQUE</label>
                      <input type="text" value={formData.ataque} onChange={(e) => setFormData({...formData, ataque: e.target.value})} placeholder="Ej: Slash, Fireball" />
                    </div>
                    <div className="form-field">
                      <label>DAÑO</label>
                      <input type="text" value={formData.damage} onChange={(e) => setFormData({...formData, damage: e.target.value})} placeholder="Ej: 2d6+4" />
                    </div>
                  </>
                )}

                {formData.category === 'armor' && (
                  <>
                    <div className="form-field">
                      <label>VIDA</label>
                      <input type="number" value={formData.vida} onChange={(e) => setFormData({...formData, vida: e.target.value})} />
                    </div>
                    <div className="form-field">
                      <label>DEFENSA</label>
                      <input type="number" value={formData.defensa} onChange={(e) => setFormData({...formData, defensa: e.target.value})} />
                    </div>
                  </>
                )}

                <div className="form-field full-width">
                  <label>EFECTO ESPECIAL</label>
                  <textarea 
                    value={formData.efecto} 
                    onChange={(e) => setFormData({...formData, efecto: e.target.value})} 
                    rows={2}
                    placeholder={formData.category === 'potion' ? 'Ej: Restaura 500 HP' : 'Ej: Quema al enemigo por 3 turnos'}
                  />
                </div>

                <div className="form-field">
                  <label>PRECIO (USD) *</label>
                  <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                </div>

                <div className="form-field">
                  <label>STOCK</label>
                  <input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                </div>

                <div className="form-field">
                  <label>DESCUENTO (%)</label>
                  <input type="number" value={formData.descuento} onChange={(e) => setFormData({...formData, descuento: e.target.value})} min="0" max="100" />
                </div>

                <div className="form-field full-width">
                  <label>IMAGEN</label>
                  <div className="image-upload-area">
                    <input type="file" accept="image/*" onChange={handleImageChange} id="product-image" className="image-input-hidden" />
                    <label htmlFor="product-image" className="image-upload-label">
                      📷 {formData.image ? formData.image.name : (editingProduct ? 'Cambiar imagen' : 'Seleccionar imagen')}
                    </label>
                    {previewImage && (
                      <div className="image-preview">
                        <img src={previewImage} alt="Preview" />
                        <button type="button" className="remove-image" onClick={() => { setFormData({...formData, image: null}); setPreviewImage(null); }}>✖</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-cancel">CANCELAR</button>
                <button type="submit" className="btn-submit">{editingProduct ? '💾 ACTUALIZAR' : '💾 GUARDAR'}</button>
              </div>
            </form>
          </div>
        ) : (
          <div className="list-section">
            <h2 className="section-title">📋 LISTA DE PRODUCTOS ({products.length})</h2>
            <div className="heroes-table-wrapper">
              {loading ? <div className="loading-state">Cargando productos...</div> : (
                <table className="heroes-table">
                  <thead>
                    <tr>
                      <th>IMG</th><th>NOMBRE</th><th>CAT</th><th>RAREZA</th><th>ESTADÍSTICAS</th><th>PRECIO</th><th>STOCK</th><th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const rarityInfo = getRarityInfo(product.rarity);
                      return (
                        <tr key={product.id}>
                          <td className="image-cell">
                            {product.image ? 
                              <img src={product.image} className="hero-avatar" /> : 
                              <div className="hero-avatar-placeholder">{getCategoryIcon(product.category)}</div>
                            }
                          </td>
                          <td className="hero-name">{product.name}</td>
                          <td>{getCategoryIcon(product.category)} {product.category}</td>
                          <td><span style={{ color: rarityInfo.color, fontWeight: 'bold' }}>{rarityInfo.label}</span></td>
                          <td style={{ fontSize: '0.7rem' }}>{getStatsDisplay(product)}</td>
                          <td className="price">${product.price} USD</td>
                          <td>{product.stock}</td>
                          <td className="actions">
                            <button className="action-edit" onClick={() => handleEdit(product)}>✏️</button>
                            <button className="action-delete" onClick={() => eliminarProducto(product.id)}>🗑️</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}