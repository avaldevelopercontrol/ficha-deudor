import React, { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import { AppLayoutContext } from './AppLayoutContext';
import '../../styles/components/app-layout.css';

interface AppLayoutProps {
  withoutSidebarPaths?: string[];
  resolveBreadcrumb: (pathname: string) => string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  withoutSidebarPaths = [],
  resolveBreadcrumb,
}) => {
  const location = useLocation();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [headerActions, setHeaderActions] =
    useState<React.ReactNode>(null);
  const isSidebarHidden = withoutSidebarPaths.includes(location.pathname);
  const breadcrumb = useMemo(
    () => resolveBreadcrumb(location.pathname),
    [location.pathname, resolveBreadcrumb]
  );

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
            breadcrumb={breadcrumb}
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