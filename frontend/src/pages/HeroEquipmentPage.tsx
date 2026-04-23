// src/pages/HeroEquipmentPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function HeroEquipmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hero, setHero] = useState(null);
  const [weapon, setWeapon] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeroEquipment();
  }, [id]);

  const fetchHeroEquipment = async () => {
    try {
      // 1. Obtener el héroe
      const heroRes = await fetch(`http://localhost:3000/api/v1/heroes/${id}`);
      const heroData = await heroRes.json();
      setHero(heroData.hero);

      // 2. Obtener el arma del héroe (NO cualquier producto)
      if (heroData.hero?.equippedWeaponId) {
        const weaponRes = await fetch(`http://localhost:3000/api/v1/weapons/${heroData.hero.equippedWeaponId}`);
        const weaponData = await weaponRes.json();
        setWeapon(weaponData.weapon);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando héroe...</div>;

  return (
    <div className="hero-equipment">
      <h1>⚔️ Equipo de {hero?.name}</h1>
      
      {weapon ? (
        <div className="weapon-card">
          <h2>Arma equipada: {weapon.name}</h2>
          <p>{weapon.description}</p>
          <div className="weapon-stats">
            <span>⚔️ Ataque: {weapon.attack}</span>
            <span>🎯 Daño: {weapon.damage}</span>
            <span>✨ Efecto: {weapon.effect}</span>
          </div>
        </div>
      ) : (
        <p>Este héroe no tiene arma equipada</p>
      )}
      
      <button onClick={() => navigate('/heroes')}>← Volver</button>
    </div>
  );
}