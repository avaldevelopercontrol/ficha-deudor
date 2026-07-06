import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../../../features/auth/contexts/authContextValue';

import '../../styles/components/app-sidebar.css';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onExpandedChange?: (isExpanded: boolean) => void;
}

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4 7h16M4 12h16M4 17h16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const GestionIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M7 4.5h10A1.5 1.5 0 0 1 18.5 6v12A1.5 1.5 0 0 1 17 19.5H7A1.5 1.5 0 0 1 5.5 18V6A1.5 1.5 0 0 1 7 4.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <path
      d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M10 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M14 8l4 4-4 4M18 12H9"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={isOpen ? 'app-sidebar__chevron--open' : ''}
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      d="M8 10l4 4 4-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isCollapsed,
  onToggleCollapsed,
  onExpandedChange,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isHovered, setIsHovered] = useState(false);
  const [isHoverLockedAfterCollapse, setIsHoverLockedAfterCollapse] =
    useState(false);

  const [isCobranzaOpen, setIsCobranzaOpen] = useState(true);

  const isExpanded =
    !isCollapsed || (isCollapsed && isHovered && !isHoverLockedAfterCollapse);

  const handleMouseEnter = () => {
    if (isHoverLockedAfterCollapse) {
      return;
    }

    setIsHovered(true);
    onExpandedChange?.(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsHoverLockedAfterCollapse(false);
    onExpandedChange?.(!isCollapsed);
  };

  const handleToggleCollapsed = () => {
    const willCollapse = !isCollapsed;

    if (willCollapse) {
      setIsHovered(false);
      setIsHoverLockedAfterCollapse(true);
      onExpandedChange?.(false);
    } else {
      setIsHoverLockedAfterCollapse(false);
      onExpandedChange?.(true);
    }

    onToggleCollapsed();
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className={[
        'app-sidebar',
        isCollapsed ? 'app-sidebar--collapsed' : 'app-sidebar--pinned',
        isExpanded ? 'app-sidebar--expanded' : '',
      ].join(' ')}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="app-sidebar__content">
        <div className="app-sidebar__header">
          <button
            type="button"
            className="app-sidebar__toggle"
            onClick={handleToggleCollapsed}
            aria-label={isCollapsed ? 'Expandir menú' : 'Minimizar menú'}
            title={isCollapsed ? 'Expandir menú' : 'Minimizar menú'}
          >
            <MenuIcon />
          </button>
        </div>

        <nav className="app-sidebar__nav" aria-label="Menú principal">
          <button
            type="button"
            className="app-sidebar__item app-sidebar__item--parent"
            onClick={() => setIsCobranzaOpen((prev) => !prev)}
            aria-expanded={isCobranzaOpen}
            title="GESTION COBRANZA"
          >
            <span className="app-sidebar__icon">
              <GestionIcon />
            </span>

            {isExpanded && (
              <>
                <span className="app-sidebar__text">GESTION COBRANZA</span>

                <span className="app-sidebar__chevron">
                  <ChevronIcon isOpen={isCobranzaOpen} />
                </span>
              </>
            )}
          </button>

          {isExpanded && isCobranzaOpen && (
            <div className="app-sidebar__submenu">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  [
                    'app-sidebar__subitem',
                    isActive ? 'app-sidebar__subitem--active' : '',
                  ].join(' ')
                }
              >
                GESTION DEUDOR
              </NavLink>
            </div>
          )}
        </nav>
      </div>

      <button
        type="button"
        className="app-sidebar__logout"
        onClick={handleLogout}
        title="Cerrar sesión"
      >
        <span className="app-sidebar__icon">
          <LogoutIcon />
        </span>

        {isExpanded && <span className="app-sidebar__text">Cerrar sesión</span>}
      </button>
    </aside>
  );
};

export default AppSidebar;