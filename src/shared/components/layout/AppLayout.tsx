import React, { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import { AppLayoutContext } from './AppLayoutContext';
import '../../styles/components/app-layout.css';

type HeaderConfig = {
  breadcrumb: string;
};

const HEADER_BY_PATH: Record<string, HeaderConfig> = {
  '/gestion-deudor': {
    breadcrumb: 'GESTIÓN DE COBRANZAS › GESTIÓN POR PERSONA/DEUDOR',
  },
  '/ficha-deudor': {
    breadcrumb: 'GESTIÓN DE COBRANZAS › FICHA DEUDOR',
  },
};

interface AppLayoutProps {
  withoutSidebarPaths?: string[];
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  withoutSidebarPaths = [],
}) => {  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [headerActions, setHeaderActions] =
    useState<React.ReactNode>(null);
  const isSidebarHidden = withoutSidebarPaths.includes(location.pathname);
  const headerConfig = useMemo(() => {
    return HEADER_BY_PATH[location.pathname] ?? {
      breadcrumb: 'GESTIÓN DE COBRANZAS',
    };
  }, [location.pathname]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((current) => !current);
  };

  return (
    <AppLayoutContext.Provider value={{ setHeaderActions }}>
      <div className="app-layout">
        {!isSidebarHidden && (
          <AppSidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapsed={handleToggleSidebar}
            onExpandedChange={setIsSidebarExpanded}
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
            breadcrumb={headerConfig.breadcrumb}
            actions={headerActions}
            showClientInfo={isSidebarHidden}
            showLogoutButton={isSidebarHidden}
          />

          <main className="app-layout__main">
            <Outlet />
          </main>
        </div>
      </div>
    </AppLayoutContext.Provider>
  );
};

export default AppLayout;