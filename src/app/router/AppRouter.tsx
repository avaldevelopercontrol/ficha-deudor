import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { LoginPage } from '../../features/auth/pages/LoginPage';
import EmailDeudorPopup from '../../features/ficha-deudor/components/popups/EmailDeudorPopup';
import AgendaDeudorPopup from '../../features/ficha-deudor/components/popups/AgendaDeudorPopup';
import PagoDeudorPopup from '../../features/ficha-deudor/components/popups/PagoDeudorPopup';
import InfDeudorPopup from '../../features/ficha-deudor/components/popups/InfDeudorPopup';

import AppLayout from '../../shared/components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

const DashboardPage = lazy(
  () => import('../../features/dashboard/pages/DashboardPage')
);

const FichaDeudor = lazy(
  () => import('../../features/ficha-deudor/pages/FichaDeudor')
);

function PageLoader() {
  return <div>Cargando...</div>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/ficha-deudor" element={<FichaDeudor />} />
            </Route>

            <Route path="/popup/email-deudor" element={<EmailDeudorPopup />} />
            <Route path="/popup/agenda-deudor" element={<AgendaDeudorPopup />} />
            <Route path="/popup/pago-deudor" element={<PagoDeudorPopup />} />
            <Route path="/popup/inf-deudor" element={<InfDeudorPopup />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}