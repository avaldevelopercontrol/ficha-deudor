import type { SelectOption } from '../../types';

export const SelectField: React.FC<{ 
  label?: string; 
  options: SelectOption[]; 
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string; 
  disabled?: boolean; 
  badge?: string;
  error?: string;
  required?: boolean;
  layout?: 'vertical' | 'inline'; // ← NUEVO
}> = ({ label, options, value, onChange, placeholder = 'Seleccionar...', disabled, badge, error, required, layout = 'vertical' }) => {
  const select = (
    <select 
      className={`form-select ${layout === 'inline' ? 'form-input--inline-field' : ''} ${error ? 'form-select--error' : ''}`} 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>{opt.label}</option>
      ))}
    </select>
  );

  if (layout === 'inline' && label) {
    return (
      <div className="form-row-inline">
        <label className="form-label form-label--inline">
          {badge && <span className="form-badge">{badge}</span>}
          {label}
          {required && <span style={{ color: 'var(--ap-red)', marginLeft: '4px' }}>*</span>}
        </label>
        <div style={{ flex: 1, minWidth: 0 }}>
          {select}
          {error && <span className="form-error">{error}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {badge && <span className="form-badge">{badge}</span>}
          {label}
          {required && <span style={{ color: '#dc3545', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      {select}
      {error && <span className="form-error" style={{ color: '#dc3545', fontSize: '0.875rem', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
};