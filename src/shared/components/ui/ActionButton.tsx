import type React from 'react';

interface ActionButtonProps {
  label: string;
  onClick?: () => void;
  variant?: string;
  size?: string;
  icon?: React.ReactNode;
  ariaLabel?: string;
  title?: string;
  disabled?: boolean;

  /**
   * Muestra un spinner, cambia el texto
   * y bloquea automáticamente el botón.
   */
  loading?: boolean;
  loadingLabel?: string;

  className?: string;
}

export const ActionButton:
  React.FC<ActionButtonProps> = ({
    label,
    onClick,
    variant = 'secondary',
    size = 'sm',
    icon,
    ariaLabel,
    title,
    disabled = false,
    loading = false,
    loadingLabel = 'Procesando...',
    className = '',
  }) => {
    const isDisabled =
      disabled || loading;

    const visibleLabel =
      loading
        ? loadingLabel
        : label;

    return (
      <button
        type="button"
        className={[
          'btn',
          `btn-${variant}`,
          `btn-${size}`,
          loading
            ? 'btn--loading'
            : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={
          loading
            ? loadingLabel
            : ariaLabel
        }
        aria-busy={loading}
        title={title}
        disabled={isDisabled}
        onClick={onClick}
      >
        {loading ? (
          <span
            className="btn-loading-spinner"
            aria-hidden="true"
          />
        ) : (
          icon && (
            <span
              className="btn-icon"
              aria-hidden="true"
            >
              {icon}
            </span>
          )
        )}

        <span className="btn-label">
          {visibleLabel}
        </span>
      </button>
    );
  };