import React from 'react';

interface PopupHeaderProps {
  logoText: string;
  logoSub: string;
  navSection: string;
  navActive: string;
  nombre?: string;
  documento?: string;
}

export const PopupHeader: React.FC<PopupHeaderProps> = ({
  logoText,
  logoSub,
  navSection,
  navActive,
  nombre,
  documento,
}) => {
  return (
    <header className="app-header">
      <div className="app-logo">
        <span className="logo-text">{logoText}</span>

        <span className="logo-sub">{logoSub}</span>
      </div>

      <nav className="app-nav">
        <span className="nav-item">{navSection}</span>

        <span className="nav-sep">›</span>

        <span className="nav-item nav-item--active">{navActive}</span>
      </nav>

      <div className="app-user">
        {nombre && (
          <span className="user-name" title={documento || undefined}>
            {nombre}
            {documento && <span className="user-doc"> — {documento}</span>}
          </span>
        )}
      </div>
    </header>
  );
};