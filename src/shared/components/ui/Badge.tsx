import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  pill?: boolean;
  dot?: boolean;
  preserveCase?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const variantStyles: Record<BadgeVariant, { color: string; bg: string }> = {
  success: { color: '#166534', bg: '#dcfce7' },
  warning: { color: '#854d0e', bg: '#fef9c3' },
  danger: { color: '#991b1b', bg: '#fee2e2' },
  info: { color: '#1e40af', bg: '#dbeafe' },
  neutral: { color: '#374151', bg: '#f3f4f6' },
};

const sizeStyles: Record<BadgeSize, React.CSSProperties> = {
  sm: {
    minHeight: '24px',
    padding: '2px 8px',
    fontSize: '10px',
  },
  md: {
    padding: '4px 10px',
    fontSize: '12px',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  pill = false,
  dot = false,
  preserveCase = false,
  className = '',
  style,
}) => {
  const variantStyle = variantStyles[variant];

  return (
    <span
      className={`badge ${className}`.trim()}
      style={{
        ...sizeStyles[size],
        borderRadius: pill ? '999px' : '12px',
        fontWeight: 600,
        color: variantStyle.color,
        backgroundColor: variantStyle.bg,
        display: dot ? 'inline-flex' : 'inline-block',
        alignItems: dot ? 'center' : undefined,
        gap: dot ? '6px' : undefined,
        textTransform: preserveCase ? 'none' : undefined,
        letterSpacing: preserveCase ? 'normal' : undefined,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {dot && (
        <span
          aria-hidden="true"
          style={{
            width: '6px',
            height: '6px',
            flex: '0 0 6px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
          }}
        />
      )}
      {children}
    </span>
  );
};
