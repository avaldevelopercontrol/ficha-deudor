import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../features/auth/contexts/authContextValue';

import '../../styles/components/app-sidebar.css';

interface AppSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
  onExpandedChange?: (isExpanded: boolean) => void;
}

const GESTION_DEUDOR_ROUTE = '/gestion-deudor';

const getRoleInitials = (role?: string) => {
  const cleanRole = role?.trim();

  if (!cleanRole) {
    return 'R';
  }

  const words = cleanRole
    .replace('-', ' ')
    .split(/\s+/)
    .filter(Boolean);

  const first = words[0]?.charAt(0) ?? '';
  const second = words[1]?.charAt(0) ?? '';

  return `${first}${second}`.toUpperCase() || 'R';
};

const GestionIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect
      x="3"
      y="3"
      width="7"
      height="7"
      rx="1"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="14"
      y="3"
      width="7"
      height="7"
      rx="1"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="3"
      y="14"
      width="7"
      height="7"
      rx="1"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <rect
      x="14"
      y="14"
      width="7"
      height="7"
      rx="1"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M16 17l5-5-5-5M21 12H9"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={isOpen ? 'app-sidebar__arrow app-sidebar__arrow--open' : 'app-sidebar__arrow'}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      d="M6 9l6 6 6-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AppSidebar: React.FC<AppSidebarProps> = () => {
  const navigate = useNavigate();
  const { usuario, clienteSeleccionada, logout } = useAuth();

  const [isCobranzaOpen, setIsCobranzaOpen] = useState(true);

  const initials = getRoleInitials(usuario?.perfil);
  
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="app-sidebar" aria-label="Menú principal">
      <div className="app-sidebar__top">
        <div className="app-sidebar__brand">
          <div className="app-sidebar__brand-title" aria-label="SISGES">
            <span className="app-sidebar__brand-letter app-sidebar__brand-letter--white">
              S
            </span>
            <span className="app-sidebar__brand-letter app-sidebar__brand-letter--red">
              I
            </span>
            <span className="app-sidebar__brand-letter app-sidebar__brand-letter--white">
              S
            </span>
            <span className="app-sidebar__brand-letter app-sidebar__brand-letter--white">
              G
            </span>
            <span className="app-sidebar__brand-letter app-sidebar__brand-letter--red">
              E
            </span>
            <span className="app-sidebar__brand-letter app-sidebar__brand-letter--white">
              S
            </span>
          </div>
        </div>

        <div className="app-sidebar__user">
          <div className="app-sidebar__avatar">
            {initials}
          </div>

          <div className="app-sidebar__user-info">
            <span className="app-sidebar__user-name">
              {usuario?.perfil || 'Perfil no definido'}
            </span>

            <span className="app-sidebar__user-role">
              {usuario?.id_usuario || 'Usuario no definido'}
            </span>
          </div>
        </div>

        {clienteSeleccionada && (
          <div className="app-sidebar__client">
            <span className="app-sidebar__client-label">
              Cliente activo
            </span>

            <span className="app-sidebar__client-name">
              {clienteSeleccionada.nombre}
            </span>
          </div>
        )}

        <nav className="app-sidebar__nav">
          <p className="app-sidebar__nav-label">Módulos</p>

          <div className="app-sidebar__nav-list">
            <button
              type="button"
              className={[
                'app-sidebar__nav-item',
                'app-sidebar__nav-item--parent',
                isCobranzaOpen ? 'app-sidebar__nav-item--active' : '',
              ].join(' ')}
              onClick={() => setIsCobranzaOpen((current) => !current)}
              aria-expanded={isCobranzaOpen}
            >
              <span className="app-sidebar__nav-icon">
                <GestionIcon />
              </span>

              <span className="app-sidebar__nav-text">
                Gestión de cobranzas
              </span>

              <ChevronIcon isOpen={isCobranzaOpen} />
            </button>

            {isCobranzaOpen && (
              <div className="app-sidebar__submenu">
                <NavLink
                  to={GESTION_DEUDOR_ROUTE}
                  className={({ isActive }) =>
                    [
                      'app-sidebar__sub-item',
                      isActive ? 'app-sidebar__sub-item--active' : '',
                    ].join(' ')
                  }
                >
                  Gestión deudor
                </NavLink>
              </div>
            )}
          </div>
        </nav>
      </div>

      <button
        type="button"
        className="app-sidebar__logout"
        onClick={handleLogout}
      >
        <span className="app-sidebar__nav-icon">
          <LogoutIcon />
        </span>

        <span>Cerrar sesión</span>
      </button>
    </aside>
  );
};

export default AppSidebar;