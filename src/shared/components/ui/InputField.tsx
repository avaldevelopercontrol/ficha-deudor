export const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { 
  label?: string; 
  wrapperClassName?: string;
  error?: string;
  layout?: 'vertical' | 'inline'; // ← NUEVO
}> = ({ label, wrapperClassName, error, layout = 'vertical', ...props }) => {
  const input = (
    <input 
      className={`form-input ${layout === 'inline' ? 'form-input--inline-field' : ''} ${error ? 'form-input--error' : ''}`} 
      {...props} 
    />
  );

  if (layout === 'inline' && label) {
    return (
      <div className={`form-row-inline ${wrapperClassName ?? ''}`}>
        <label className="form-label form-label--inline">
          {label}
          {props.required && <span style={{ color: 'var(--ap-red)', marginLeft: '4px' }}>*</span>}
        </label>
        <div style={{ flex: 1, minWidth: 0 }}>
          {input}
          {error && <span className="form-error">{error}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className={`form-group ${wrapperClassName ?? ''}`}>
      {label && <label className="form-label">{label}</label>}
      {input}
      {error && <span className="form-error" style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
};
