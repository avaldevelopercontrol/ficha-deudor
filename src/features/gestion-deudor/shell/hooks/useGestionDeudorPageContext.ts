import { useEffect } from 'react';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  AUTH_ROUTES,
} from '@features/auth/constants';
import {
  useAuth,
} from '@features/auth/hooks/useAuth';
import {
  clearFichaDeudorSession,
} from '@features/ficha-deudor/shared/utils/fichaDeudorSession.utils';

export const useGestionDeudorPageContext = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, clienteSeleccionada } =
    useAuth();

  const idCliente =
    clienteSeleccionada?.id_cliente ?? '';
  const idUsuario = usuario?.id_usuario ?? '';

  useEffect(() => {
    clearFichaDeudorSession();

    if (location.search) {
      navigate(AUTH_ROUTES.GESTION_DEUDOR, {
        replace: true,
      });
    }
  }, [location.search, navigate]);

  return {
    idCliente,
    idUsuario,
  };
};
