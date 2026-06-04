import React from 'react';

interface FormGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: string;
  style?: React.CSSProperties;
}

export const FormGrid: React.FC<FormGridProps> = ({
  children,
  columns = 2,
  gap = '10px',
  style,
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap,
      ...style,
    }}
  >
    {children}
  </div>
);