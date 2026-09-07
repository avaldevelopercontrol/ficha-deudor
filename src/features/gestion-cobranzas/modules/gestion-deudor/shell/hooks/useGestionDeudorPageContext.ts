import {
  useEffect,
  useMemo,
} from 'react';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  useAuth,
} from '@features/auth/hooks/useAuth';
import {
  GESTION_COBRANZAS_ROUTES,
} from '@features/gestion-cobranzas/constants/gestionCobranzasRoutes.constants';
import {
  clearFichaDeudorSession,
} from '@features/ficha-deudor/shared/utils/fichaDeudorSession.utils';

import {
  resolveGestionDeudorIdentity,
} from '../../utils/gestionDeudorIdentity.utils';

export const useGestionDeudorPageContext = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, clienteSeleccionada } =
    useAuth();

  const identity = useMemo(
    () =>
      resolveGestionDeudorIdentity(
        clienteSeleccionada?.id_cliente,
        usuario?.id_usuario
      ),
    [
      clienteSeleccionada?.id_cliente,
      usuario?.id_usuario,
    ]
  );

  useEffect(() => {
    clearFichaDeudorSession();

    if (location.search) {
      navigate(GESTION_COBRANZAS_ROUTES.GESTION_DEUDOR, {
        replace: true,
      });
    }
  }, [location.search, navigate]);

  return {
    identity,
  };
};
