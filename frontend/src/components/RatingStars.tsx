// src/components/RatingStars.tsx
import { useState } from 'react';
import { ratingsApi } from '@/api/ratings';
import './RatingStars.css';

interface RatingStarsProps {
  productId: string;
  initialRating?: number | null;
  average?: number;
  totalRatings?: number;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
  onRate?: () => void;
}

export default function RatingStars({ 
  productId, 
  initialRating = null, 
  average = 0, 
  totalRatings = 0,
  readonly = false,
  size = 'medium',
  onRate
}: RatingStarsProps) {
  const [userRating, setUserRating] = useState<number | null>(initialRating);
  const [hover, setHover] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractNumberFromId = (id: string): number => {
    if (/^\d+$/.test(id)) {
      return parseInt(id, 10);
    }
    const match = id.match(/\d+$/);
    if (!match) {
      throw new Error('ID de producto inválido');
    }
    return parseInt(match[0], 10);
  };

  const handleClick = async (e: React.MouseEvent, score: number) => {
    e.stopPropagation(); // ✅ IMPORTANTE: Evita que el click llegue a la card
    e.preventDefault();
    
    if (readonly || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const numericId = extractNumberFromId(productId);
      await ratingsApi.rateProduct(numericId, score);
      setUserRating(score);
      if (onRate) onRate();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al calificar');
      console.error('Error rating:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = (star: number) => {
    if (!readonly && !loading) {
      setHover(star);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly && !loading) {
      setHover(null);
    }
  };

  const starSize = {
    small: '1.2rem',
    medium: '1.8rem',
    large: '2.5rem'
  }[size];

  const displayRating = hover !== null ? hover : userRating;

  return (
    <div className="rating-stars-container">
      <div 
        className="rating-stars"
        style={{ fontSize: starSize }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= (displayRating || 0) ? 'filled' : ''} ${loading ? 'loading' : ''}`}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => handleClick(e, star)} // ✅ Pasar el evento
            style={{ cursor: readonly || loading ? 'default' : 'pointer' }}
          >
            ★
          </span>
        ))}
      </div>
      
      {average > 0 && (
        <div className="rating-info">
          <span className="rating-average">{average.toFixed(1)}</span>
          <span className="rating-count">
            ({totalRatings} {totalRatings === 1 ? 'voto' : 'votos'})
          </span>
        </div>
      )}
      
      {userRating !== null && !readonly && (
        <div className="user-rating">
          Tu calificación: {userRating} ★
        </div>
      )}
      
      {error && (
        <div className="rating-error">⚠️ {error}</div>
      )}
      
      {loading && (
        <div className="rating-loading">⏳ Calificando...</div>
      )}
    </div>
  );
}