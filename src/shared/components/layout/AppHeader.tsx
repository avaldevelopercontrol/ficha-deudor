import React from 'react';
import { useAuth } from '../../../features/auth/contexts/authContextValue';
import '../../styles/components/app-header.css';

interface AppHeaderProps {
  breadcrumb: string;
  actions?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  breadcrumb,
  actions,
}) => {
  const { usuario, clienteSeleccionada } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header__left">
        <div className="app-header__brand">
          <span className="logo-text">AVAL</span>
          <span className="logo-sub">PERÚ</span>
        </div>

        <span className="app-header__breadcrumb">{breadcrumb}</span>
      </div>

      <div className="app-header__right">
        <div className="app-header__user">
          <span>
            <strong>Usuario:</strong> {usuario?.nombre} {usuario?.apellido}
          </span>

          <span className="app-header__separator">•</span>

          <span>
            <strong>Cliente:</strong> {clienteSeleccionada?.nombre}
          </span>
        </div>

        {actions && (
          <div className="app-header__actions">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;