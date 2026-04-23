import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export default function Input({ error, className = '', ...props }: InputProps) {
  return (
    <div style={{ width: '100%' }}>
      <input
        className={`nbv-input ${error ? 'error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--color-crimson-bright)',
          fontStyle: 'italic',
          marginTop: '0.3rem'
        }}>
          ⚠ {error}
        </div>
      )}
    </div>
  );
}