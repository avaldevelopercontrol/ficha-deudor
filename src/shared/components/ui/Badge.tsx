import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
  style?: React.CSSProperties;
}

const variantStyles: Record<string, { color: string; bg: string }> = {
  success: { color: '#166534', bg: '#dcfce7' },
  warning: { color: '#854d0e', bg: '#fef9c3' },
  danger: { color: '#991b1b', bg: '#fee2e2' },
  info: { color: '#1e40af', bg: '#dbeafe' },
  neutral: { color: '#374151', bg: '#f3f4f6' },
};

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral',
  className = '',
  style,
}) => {
  const estilo = variantStyles[variant];
  
  return (
    <span
      className={`badge ${className}`}
      style={{
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 600,
        color: estilo.color,
        backgroundColor: estilo.bg,
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </span>
  );
};