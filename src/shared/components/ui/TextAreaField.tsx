export const TextAreaField: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { 
  label?: string;
  error?: string;
  layout?: 'vertical' | 'inline'; // ← NUEVO
}> = ({ label, error, layout = 'vertical', ...props }) => {
  const textarea = (
    <textarea 
      className={`form-input form-textarea ${error ? 'form-input--error' : ''}`} 
      {...props} 
    />
  );

  if (layout === 'inline' && label) {
    return (
      <div className="form-row-inline" style={{ alignItems: 'flex-start' }}>
        <label className="form-label form-label--inline" style={{ marginTop: 4 }}>
          {label}
        </label>
        <div style={{ flex: 1, minWidth: 0 }}>
          {textarea}
          {error && <span className="form-error">{error}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      {textarea}
      {error && <span className="form-error" style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
};