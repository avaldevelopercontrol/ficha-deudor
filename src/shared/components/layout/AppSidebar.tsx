import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../features/auth/contexts/authContextValue';
import { GESTION_USUARIOS_ROUTES } from '../../../features/gestion-usuarios/constants/gestionUsuariosRoutes.constants';
import { AUTH_ROUTES } from '../../../features/auth/constants';
import SidebarMenuSection from './SidebarMenuSection';
import '../../styles/components/app-sidebar.css';
import { GESTION_USUARIOS_FEATURE } from '../../../features/gestion-usuarios/constants/gestionUsuariosFeature.constants';

interface AppSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
  onExpandedChange?: (isExpanded: boolean) => void;
}

const getRoleInitials = (role?: string) => {
  const cleanRole = role?.trim();

  if (!cleanRole) {
    return 'R';
  }

  const words = cleanRole
    .replaceAll('-', ' ')
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

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <circle
      cx="9"
      cy="7"
      r="4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />

    <path
      d="M23 21v-2a4 4 0 0 0-3-3.87"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M16 3.13a4 4 0 0 1 0 7.75"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
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

export const AppSidebar: React.FC<AppSidebarProps> = () => {
  const navigate = useNavigate();

  const {
    usuario,
    clienteSeleccionada,
    logout,
  } = useAuth();

  const [isCobranzaOpen, setIsCobranzaOpen] = useState(true);
  const [isUsuariosOpen, setIsUsuariosOpen] = useState(true);

  const initials = getRoleInitials(usuario?.perfil);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className="app-sidebar"
      aria-label="Menú principal"
    >
      <div className="app-sidebar__top">
        <div className="app-sidebar__brand">
          <div
            className="app-sidebar__brand-title"
            aria-label="SISGES"
          >
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
          <div
            className="app-sidebar__avatar"
            aria-hidden="true"
          >
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

        <nav
          className="app-sidebar__nav"
          aria-label="Módulos del sistema"
        >
          <p className="app-sidebar__nav-label">
            Módulos
          </p>

          <div className="app-sidebar__nav-list">
            <SidebarMenuSection
              label="Gestión de cobranzas"
              icon={<GestionIcon />}
              isOpen={isCobranzaOpen}
              onToggle={() => {
                setIsCobranzaOpen((current) => !current);
              }}
              items={[
                {
                  label: 'Gestión deudor',
                  to: AUTH_ROUTES.GESTION_DEUDOR,
                },
              ]}
            />

            {GESTION_USUARIOS_FEATURE.enabled && (
              <SidebarMenuSection
                label="Gestión de usuarios"
                icon={<UsersIcon />}
                isOpen={isUsuariosOpen}
                onToggle={() => {
                  setIsUsuariosOpen((current) => !current);
                }}
                items={[
                  {
                    label: 'Cambiar clave',
                    to: GESTION_USUARIOS_ROUTES.CAMBIAR_CLAVE,
                  },
                  {
                    label: 'Asignar usuario',
                    to: GESTION_USUARIOS_ROUTES.ASIGNAR_USUARIO,
                  },
                  {
                    label: 'Mantener usuario',
                    to: GESTION_USUARIOS_ROUTES.MANTENER_USUARIO,
                  },
                ]}
              />
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