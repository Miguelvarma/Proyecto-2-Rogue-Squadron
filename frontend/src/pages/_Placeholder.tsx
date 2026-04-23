interface PlaceholderProps {
  name: string;
}

export default function Placeholder({ name }: PlaceholderProps) {
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '960px',
      margin: '0 auto',
      color: 'var(--color-parchment, #e7dfcf)',
    }}>
      <div style={{
        border: '1px solid rgba(200,134,10,0.25)',
        background: 'rgba(0,0,0,0.25)',
        padding: '1.25rem',
        borderRadius: '14px',
      }}>
        <div style={{
          fontFamily: 'var(--font-title, ui-serif)',
          letterSpacing: '.08em',
          color: 'var(--color-gold, #d4a017)',
          marginBottom: '.35rem',
          fontSize: '1.1rem',
        }}>
          {name}
        </div>
        <div style={{ opacity: 0.85 }}>
          Esta vista está en modo placeholder. La navegación y layout deberían estar funcionando.
        </div>
      </div>
    </div>
  );
}

