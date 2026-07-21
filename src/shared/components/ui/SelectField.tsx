import type { SelectOption } from '../../types';

type SelectFieldProps<T extends string | number | boolean = string> = {
  label?: string;
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  badge?: string;
  error?: string;
  required?: boolean;
  layout?: 'vertical' | 'inline';
  hidePlaceholder?: boolean;
};

export const SelectField = <T extends string | number | boolean = string>({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  disabled,
  badge,
  error,
  required,
  layout = 'vertical',
  hidePlaceholder = false,
}: SelectFieldProps<T>) => {
  const hasValue = String(value) !== '';

  const select = (
    <select
      className={`form-select ${
        hasValue
          ? 'form-select--has-value'
          : 'form-select--placeholder'
      } ${
        layout === 'inline'
          ? 'form-input--inline-field'
          : ''
      } ${error ? 'form-select--error' : ''}`}
      value={String(value)}
      onChange={(e) => {
        const rawValue = e.target.value;

        // ✅ FIX DEFINITIVO: Si seleccionó placeholder (vacío), enviar string vacío
        if (rawValue === '') {
          onChange('' as T);
          return;
        }

        const selected = options.find(
          (opt) => String(opt.id) === rawValue
        );

        if (selected) {
          onChange(selected.id);
        }
      }}
      disabled={disabled}
    >
      {!hidePlaceholder && (
        <option value="">{placeholder}</option>
      )}

      {options.map((opt) => (
        <option key={String(opt.id)} value={String(opt.id)}>
          {opt.label}
        </option>
      ))}
    </select>
  );

  if (layout === 'inline' && label) {
    return (
      <div className="form-row-inline">
        <label className="form-label form-label--inline">
          {badge && <span className="form-badge">{badge}</span>}
          {label}
          {required && (
            <span style={{ color: 'var(--ap-red)', marginLeft: '4px' }}>
              *
            </span>
          )}
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
          {required && (
            <span style={{ color: '#dc3545', marginLeft: '4px' }}>
              *
            </span>
          )}
        </label>
      )}
      {select}
      {error && (
        <span
          className="form-error"
          style={{
            color: '#dc3545',
            fontSize: '0.875rem',
            marginTop: '4px',
            display: 'block',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};