import type React from 'react';

import {
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  useAccessControl,
} from '../../../features/access-control';

import {
  AUTH_ROUTES,
} from '../../../features/auth/constants';

import {
  useAuth,
} from '../../../features/auth/hooks/useAuth';

import {
  SisgesIcon,
} from '../../icons/sisges';

import SidebarMenuSection from './SidebarMenuSection';

import '../../styles/components/app-sidebar.css';

interface AppSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapsed?: () => void;
  onExpandedChange?: (
    isExpanded: boolean
  ) => void;
}

const getRoleInitials = (
  role?: string
) => {
  const cleanRole = role?.trim();

  if (!cleanRole) {
    return 'R';
  }

  const words = cleanRole
    .replaceAll('-', ' ')
    .split(/\s+/)
    .filter(Boolean);

  const first =
    words[0]?.charAt(0) ?? '';

  const second =
    words[1]?.charAt(0) ?? '';

  return `${first}${second}`
    .toUpperCase() || 'R';
};

const LogoutIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
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

export const AppSidebar: React.FC<
  AppSidebarProps
> = () => {
  const navigate = useNavigate();

  const {
    usuario,
    clienteSeleccionada,
    logout,
  } = useAuth();

  const {
    status,
    error,
    navigationTree,
  } = useAccessControl();

  const [openSections, setOpenSections] =
    useState<Record<string, boolean>>(
      {}
    );

  const initials = getRoleInitials(
    usuario?.perfil
  );

  const handleLogout = () => {
    logout();
    navigate(
      AUTH_ROUTES.LOGIN,
      {
        replace: true,
      }
    );
  };

  const toggleSection = (
    optionCode: string
  ) => {
    setOpenSections(
      (currentSections) => ({
        ...currentSections,
        [optionCode]:
          !(currentSections[
            optionCode
          ] ?? true),
      })
    );
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
              {usuario?.perfil ||
                'Perfil no definido'}
            </span>

            <span className="app-sidebar__user-role">
              {usuario?.id_usuario ||
                'Usuario no definido'}
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
            {(
              status === 'idle' ||
              status === 'loading'
            ) && (
              <p className="app-sidebar__status">
                Cargando accesos...
              </p>
            )}

            {status === 'error' && (
              <p className="app-sidebar__status app-sidebar__status--error">
                {error ??
                  'No se pudieron cargar los accesos.'}
              </p>
            )}

            {status === 'ready' &&
              navigationTree.length === 0 && (
                <p className="app-sidebar__status">
                  Sin módulos habilitados.
                </p>
              )}

            {status === 'ready' &&
              navigationTree.map(
                (module) => {
                  const items =
                    module.children
                      .filter(
                        (child) =>
                          child.route !== null
                      )
                      .map((child) => ({
                        label: child.name,
                        to: child.route as string,
                        disabled:
                          !child.permissions
                            .consultar,
                      }));

                  return (
                    <SidebarMenuSection
                      key={module.code}
                      label={module.name}
                      icon={
                        <SisgesIcon
                          name={module.icon}
                          aria-hidden="true"
                        />
                      }
                      isOpen={
                        openSections[
                          module.code
                        ] ?? true
                      }
                      items={items}
                      to={
                        module.route ??
                        undefined
                      }
                      disabled={
                        !module.permissions
                          .consultar
                      }
                      onToggle={() => {
                        toggleSection(
                          module.code
                        );
                      }}
                    />
                  );
                }
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
