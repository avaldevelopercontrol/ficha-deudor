import React from 'react';
import type { SelectOption } from '../../types';

// ═══════════════════════════════════════════════════
// FIELD ROW (sin cambios)
// ═══════════════════════════════════════════════════
export const FieldRow: React.FC<{ label: string; value?: string | number; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`field-row ${highlight ? 'field-highlight' : ''}`}>
    <span className="field-label">{label}:</span>
    <span className="field-value">{value ?? '—'}</span>
  </div>
);

// ═══════════════════════════════════════════════════
// INPUT FIELD — con layout inline
// ═══════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════
// TEXT AREA FIELD — con layout inline
// ═══════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════
// SELECT FIELD — con layout inline
// ═══════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════
// RESTO DE COMPONENTES (sin cambios)
// ═══════════════════════════════════════════════════
export const SectionHeader: React.FC<{ title: string; accent?: boolean }> = ({ title, accent }) => (
  <div className={`section-header ${accent ? 'section-header--accent' : ''}`}>
    <span className="section-title">{title}</span>
  </div>
);

export const ActionButton: React.FC<{ label: string; onClick?: () => void; variant?: string; size?: string; icon?: string }> = ({ label, onClick, variant = 'secondary', size = 'sm', icon }) => (
  <button className={`btn btn-${variant} btn-${size}`} onClick={onClick} type="button">
    {icon && <span className="btn-icon">{icon}</span>}
    {label}
  </button>
);

export const CheckboxField: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="checkbox-wrapper">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="checkbox-input" />
    <span className="checkbox-label">{label}</span>
  </label>
);

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getVariant = (s: string) => {
    const upper = s.toUpperCase();
    if (['VENCIDO', 'IMPAGO', 'MORA', 'PREJUDICIAL'].includes(upper)) return 'danger';
    if (['PAGADO', 'AL DIA'].includes(upper)) return 'success';
    if (['PROMESA', 'EN_PROCESO', 'EN PROCESO'].includes(upper)) return 'warning';
    return 'neutral';
  };
  return <span className={`status-badge status-badge--${getVariant(status)}`}>{status}</span>;
};