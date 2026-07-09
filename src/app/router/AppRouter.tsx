import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import { FICHA_DEUDOR_ROUTES } from '../../features/ficha-deudor/shared/constants/fichaDeudorRoutes.constants';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import EmailDeudorPopup from '../../features/ficha-deudor/modules/emails/components/EmailDeudorPopup';
import AgendaDeudorPopup from '../../features/ficha-deudor/modules/agenda/components/AgendaDeudorPopup';
import PagoDeudorPopup from '../../features/ficha-deudor/modules/pago/components/PagoDeudorPopup';
import InfDeudorPopup from '../../features/ficha-deudor/modules/inf-deudor/components/InfDeudorPopup';
import ListaGestoresPopup from '../../features/ficha-deudor/modules/lista-gestores/components/ListaGestoresPopup';
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
              <Route path={FICHA_DEUDOR_ROUTES.FICHA_DEUDOR} element={<FichaDeudor />} />
            </Route>

            <Route
              path={FICHA_DEUDOR_ROUTES.POPUP_EMAIL_DEUDOR}
              element={<EmailDeudorPopup />}
            />

            <Route
              path={FICHA_DEUDOR_ROUTES.POPUP_AGENDA_DEUDOR}
              element={<AgendaDeudorPopup />}
            />

            <Route
              path={FICHA_DEUDOR_ROUTES.POPUP_PAGO_DEUDOR}
              element={<PagoDeudorPopup />}
            />

            <Route
              path={FICHA_DEUDOR_ROUTES.POPUP_INF_DEUDOR}
              element={<InfDeudorPopup />}
            />

            <Route
              path={FICHA_DEUDOR_ROUTES.POPUP_LISTA_GESTORES}
              element={<ListaGestoresPopup />}
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}