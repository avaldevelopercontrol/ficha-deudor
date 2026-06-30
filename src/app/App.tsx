import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks';
import { LoginPage } from '../features/auth/pages';
import EmailDeudorPopup from '../features/ficha-deudor/components/popups/EmailDeudorPopup';
import AgendaDeudorPopup from '../features/ficha-deudor/components/popups/AgendaDeudorPopup';
import PagoDeudorPopup from '../features/ficha-deudor/components/popups/PagoDeudorPopup';
import InfDeudorPopup from '../features/ficha-deudor/components/popups/InfDeudorPopup';

// Lazy loading
const DashboardPage = React.lazy(() => import('../features/dashboard/pages/DashboardPage'));
const FichaDeudor = React.lazy(() => import('../features/ficha-deudor/pages/FichaDeudor'));

const App: React.FC = () => {
  const { usuario, clienteSeleccionada } = useAuth();
  const isFullyAuthenticated = !!usuario && !!clienteSeleccionada;

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta raíz: dashboard con query params */}
        <Route
          path="/"
          element={
            isFullyAuthenticated ? (
              <React.Suspense fallback={<div>Cargando...</div>}>
                <DashboardPage />
              </React.Suspense>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            isFullyAuthenticated ? (
              <Navigate to={`/?id_cliente=${clienteSeleccionada?.id_cliente}&id_usuario=${usuario?.id_usuario}`} replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* Ficha-deudor: acepta query params */}
        <Route
          path="/ficha-deudor"
          element={
            isFullyAuthenticated ? (
              <React.Suspense fallback={<div>Cargando...</div>}>
                <FichaDeudor />
              </React.Suspense>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Redirección por defecto */}
        <Route
          path="*"
          element={
            <Navigate to={isFullyAuthenticated ? `/?id_cliente=${clienteSeleccionada?.id_cliente}&id_usuario=${usuario?.id_usuario}` : '/login'} replace />
          }
        />
         <Route path="/popup/email-deudor/:id_cliente/:id_deudor/:id_usuario" element={<EmailDeudorPopup />} />
         <Route path="/popup/agenda-deudor/:id_cliente/:id_cartera/:id_deudor/:id_usuario" element={<AgendaDeudorPopup />} />
         <Route path="/popup/pago-deudor/:id_cliente/:id_cartera/:id_deudor" element={<PagoDeudorPopup />} />
         <Route path="/popup/inf-deudor/:id_cliente/:id_cartera/:id_deudor/:id_usuario" element={<InfDeudorPopup />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;