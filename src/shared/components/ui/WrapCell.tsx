import React from 'react';

interface WrapCellProps {
  children: React.ReactNode;
  color?: string;
  weight?: number;
  fontSize?: string;
}

export const WrapCell: React.FC<WrapCellProps> = ({ 
  children, 
  color = '#1a2540', 
  weight = 400,
  fontSize = '11px',
}) => (
  <span style={{
    fontSize,
    color,
    fontWeight: weight,
    display: 'block',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    lineHeight: '1.4',
    maxWidth: '100%',
  }}>
    {children}
  </span>
);