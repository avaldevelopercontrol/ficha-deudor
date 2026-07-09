import React from 'react';
import { useNavigate } from 'react-router-dom';

import { AUTH_ROUTES } from '../../../features/auth/constants';
import { useAuth } from '../../../features/auth/contexts/authContextValue';
import '../../styles/components/app-header.css';

interface AppHeaderProps {
  breadcrumb: string;
  actions?: React.ReactNode;
  showClientInfo?: boolean;
  showLogoutButton?: boolean;
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  breadcrumb,
  actions,
  showClientInfo = true,
  showLogoutButton = false,
}) => {
  const navigate = useNavigate();
  const { usuario, clienteSeleccionada, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(AUTH_ROUTES.LOGIN, { replace: true });
  };

  return (
    <header className="app-header">
      <div className="app-header__left">
        {showLogoutButton && (
          <button
            type="button"
            className="app-header__logout"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogoutIcon />
          </button>
        )}

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

          {showClientInfo && clienteSeleccionada && (
            <>
              <span className="app-header__separator">•</span>

              <span>
                <strong>Cliente:</strong> {clienteSeleccionada.nombre}
              </span>
            </>
          )}
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