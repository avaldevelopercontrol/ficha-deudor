import React from 'react';

interface PanelLayoutProps {
  title: string;
  isActive: boolean;
  children: React.ReactNode;
  className?: string;
}

export const PanelLayout: React.FC<PanelLayoutProps> = ({ 
  title, 
  isActive, 
  children,
  className = '',
}) => {
  if (!isActive) return null;

  return (
    <div className={`ficha-card panel-colapsable ${className}`}>
      <div className="panel-colapsable-header">
        <span className="panel-colapsable-title">{title}</span>
      </div>
      <div className="panel-colapsable-body">
        {children}
      </div>
    </div>
  );
};