import React from 'react';

export type FeedbackMessageVariant = 'success' | 'error' | 'warning' | 'info';

interface FeedbackMessageProps {
  variant?: FeedbackMessageVariant;
  title?: string;
  message: string;
  onClose?: () => void;
}

const variantConfig: Record<
  FeedbackMessageVariant,
  {
    borderColor: string;
    backgroundColor: string;
    color: string;
  }
> = {
  success: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
    color: '#166534',
  },
  error: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
  },
  warning: {
    borderColor: '#d97706',
    backgroundColor: '#fffbeb',
    color: '#92400e',
  },
  info: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
    color: '#1e40af',
  },
};

export const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  variant = 'info',
  title,
  message,
  onClose,
}) => {
  const styles = variantConfig[variant];

  return (
    <div
      role="alert"
      style={{
        border: `1px solid ${styles.borderColor}`,
        borderLeft: `4px solid ${styles.borderColor}`,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        borderRadius: '6px',
        padding: '10px 12px',
        margin: '8px 0',
        fontSize: '13px',
        display: 'flex',
        justifyContent: 'space-between',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      <div>
        {title && (
          <strong style={{ display: 'block', marginBottom: '2px' }}>
            {title}
          </strong>
        )}

        <span>{message}</span>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar mensaje"
          style={{
            border: 'none',
            background: 'transparent',
            color: styles.color,
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '14px',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};