import './Badge.css';

interface BadgeProps {
  variant?: 'gold' | 'crimson' | 'arcane' | 'emerald' | 'ice' | 'gray';
  children: React.ReactNode;
}

export default function Badge({ variant = 'gray', children }: BadgeProps) {
  return (
    <span className={`nbv-badge nbv-badge-${variant}`}>
      {children}
    </span>
  );
}