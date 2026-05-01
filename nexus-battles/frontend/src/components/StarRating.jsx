import { useState } from 'react';

export default function StarRating({ value = 0, onChange, readonly = false, size = '1.5rem' }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div style={{ display: 'inline-flex', gap: '0.15rem', cursor: readonly ? 'default' : 'pointer' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          style={{
            fontSize: size,
            color: star <= display ? '#f59e0b' : '#2d3748',
            transition: 'color 0.15s, transform 0.12s',
            transform: !readonly && star <= display ? 'scale(1.15)' : 'scale(1)',
            userSelect: 'none',
          }}
          onClick={() => !readonly && onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
