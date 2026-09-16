import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import { AppLayoutContext } from './AppLayoutContext';
import { ClienteSelectorModal } from '../../../features/auth/modules/cliente-selector';
import { AUTH_ROUTES } from '../../../features/auth/constants';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { matchesWithoutSidebarPath } from './appLayout.utils';
import '../../styles/components/app-layout.css';

interface AppLayoutProps {
  withoutSidebarPaths?: string[];
  clientSwitcherDisabledPaths?: string[];
  resolveBreadcrumb: (pathname: string) => string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  withoutSidebarPaths = [],
  clientSwitcherDisabledPaths = [],
  resolveBreadcrumb,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, clienteSeleccionada, seleccionarCliente } = useAuth();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [headerActions, setHeaderActions] =
    useState<React.ReactNode>(null);
  const [isClientSwitcherOpen, setIsClientSwitcherOpen] = useState(false);
  const isSidebarHidden =
    matchesWithoutSidebarPath(
      location.pathname,
      withoutSidebarPaths
    );
  const isClientSwitcherDisabled = matchesWithoutSidebarPath(
    location.pathname,
    clientSwitcherDisabledPaths
  );
  const breadcrumb = useMemo(
    () => resolveBreadcrumb(location.pathname),
    [location.pathname, resolveBreadcrumb]
  );

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((current) => !current);
  };

  const handleOpenClientSwitcher = useCallback(() => {
    setIsClientSwitcherOpen(true);
  }, []);

  const handleCloseClientSwitcher = useCallback(() => {
    setIsClientSwitcherOpen(false);
  }, []);

  const handleChangeClient = useCallback(
    (cliente: NonNullable<typeof clienteSeleccionada>) => {
      seleccionarCliente(cliente);
      setIsClientSwitcherOpen(false);
      navigate(AUTH_ROUTES.MENU_MODULOS, { replace: true });
    },
    [navigate, seleccionarCliente]
  );

  return (
    <AppLayoutContext.Provider value={{ setHeaderActions }}>
      <div className="app-layout">
        {!isSidebarHidden && (
          <AppSidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapsed={handleToggleSidebar}
            onExpandedChange={setIsSidebarExpanded}
            onChangeClient={
              isClientSwitcherDisabled ? undefined : handleOpenClientSwitcher
            }
          />
        )}

        <div
          className={[
            'app-layout__body',
            isSidebarHidden
              ? 'app-layout__body--without-sidebar'
              : isSidebarExpanded
                ? 'app-layout__body--sidebar-expanded'
                : 'app-layout__body--sidebar-collapsed',
          ].join(' ')}
        >
          <AppHeader
            breadcrumb={breadcrumb}
            actions={headerActions}
            showClientInfo={isSidebarHidden}
            showLogoutButton={isSidebarHidden}
            onChangeClient={
              isSidebarHidden && !isClientSwitcherDisabled
                ? handleOpenClientSwitcher
                : undefined
            }
          />

          <main className="app-layout__main">
            <Suspense
              fallback={
                <div role="status">
                  Cargando...
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </main>
        </div>

        {usuario && (
          <ClienteSelectorModal
            isOpen={isClientSwitcherOpen}
            usuario={usuario}
            currentCliente={clienteSeleccionada}
            mode="switch"
            onClose={handleCloseClientSwitcher}
            onContinue={handleChangeClient}
          />
        )}
      </div>
    </AppLayoutContext.Provider>
  );
};

export default AppLayout;