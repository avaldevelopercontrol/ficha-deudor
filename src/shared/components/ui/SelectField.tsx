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
  wrapperClassName?: string;
  className?: string;
  id?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  hint?: string;
  hintId?: string;
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
  wrapperClassName = '',
  className = '',
  id,
  ariaLabel,
  ariaDescribedBy,
  hint,
  hintId,
}: SelectFieldProps<T>) => {
  const hasValue = String(value) !== '';

  const select = (
    <select
      id={id}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      className={`form-select ${
        hasValue
          ? 'form-select--has-value'
          : 'form-select--placeholder'
      } ${
        layout === 'inline'
          ? 'form-input--inline-field'
          : ''
      } ${error ? 'form-select--error' : ''} ${className}`.trim()}
      value={String(value)}
      onChange={(e) => {
        const rawValue = e.target.value;

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
        <option
          key={String(opt.id)}
          value={String(opt.id)}
          disabled={opt.disabled}
        >
          {opt.label}
        </option>
      ))}
    </select>
  );

  const hintNode = hint ? (
    <small className="form-hint" id={hintId}>{hint}</small>
  ) : null;

  if (layout === 'inline' && label) {
    return (
      <div className={`form-row-inline ${wrapperClassName}`.trim()}>
        <label className="form-label form-label--inline" htmlFor={id}>
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
          {hintNode}
        </div>
      </div>
    );
  }

  return (
    <div className={`form-group ${wrapperClassName}`.trim()}>
      {label && (
        <label className="form-label" htmlFor={id}>
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
      {hintNode}
    </div>
  );
};
