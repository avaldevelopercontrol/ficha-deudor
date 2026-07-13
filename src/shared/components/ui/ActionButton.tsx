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
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  variant = 'secondary',
  size = 'sm',
  icon,
  ariaLabel,
  title,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type="button"
      className={[
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && (
        <span className="btn-icon" aria-hidden="true">
          {icon}
        </span>
      )}

      {label}
    </button>
  );
};