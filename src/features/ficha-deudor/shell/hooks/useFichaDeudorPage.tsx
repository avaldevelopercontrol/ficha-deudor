import type { FichaDeudorPanel } from '../constants/fichaDeudorPanels.constants';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { GestionFormClaro } from '../../modules/gestion/types/fichaGestion.types';
import { AUTH_ROUTES } from '@features/auth/constants';
import { ActionButton } from '@shared/components/ui/ActionButton';
import { useAppLayout } from '@shared/components/layout/AppLayoutContext';

import type { FichaDeudorIdentityParams } from '../../shared/types/fichaDeudor.types';
import type { DocumentoApi } from '../../shared/types';
import { clearFichaDeudorSession } from '../../shared/utils/fichaDeudorSession.utils';
import {
  useCabeceraHeader,
  useDeudorHeader,
} from '../../modules/deudor-header/hooks/useDeudorHeader';

type UseFichaDeudorPageParams =
  FichaDeudorIdentityParams & {
    onGestionRegistrada: (
      fechaFinGestion: string
    ) => void;
  };
  
const getReturnPath = (state: unknown): string | null => {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const from = (state as { from?: unknown }).from;

  return typeof from === 'string' ? from : null;
};

export const useFichaDeudorPage = ({
  id_cliente,
  id_cartera,
  id_deudor,
  onGestionRegistrada,
}: UseFichaDeudorPageParams) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setHeaderActions } = useAppLayout();

  const returnPath = getReturnPath(location.state);

  const [contacto, setContacto] = useState('');
  const [panelActivo, setPanelActivo] =
    useState<FichaDeudorPanel | null>(null);
  const [telefonoSeleccionado, setTelefonoSeleccionado] =
    useState('');
  const [documentosFiltrados, setDocumentosFiltrados] = useState<
    DocumentoApi[]
  >([]);
  const [gestionRealizadaRefreshKey, setGestionRealizadaRefreshKey] =
    useState(0);

  const { data: deudorData } = useDeudorHeader(
    id_cliente,
    id_cartera,
    id_deudor
  );

  const {
    data: cabeceraData,
    isLoading: isLoadingCabecera,
    error: cabeceraError,
  } = useCabeceraHeader(
    id_cliente,
    id_cartera
  );

  const goToGestionDeudor = useCallback(() => {
    clearFichaDeudorSession();

    if (returnPath === AUTH_ROUTES.GESTION_DEUDOR) {
      navigate(-1);
      return;
    }

    navigate(AUTH_ROUTES.GESTION_DEUDOR, {
      replace: true,
    });
  }, [navigate, returnPath]);

  const handleCancelar = useCallback(() => {
    goToGestionDeudor();
  }, [goToGestionDeudor]);

  useEffect(() => {
    setHeaderActions(
      <ActionButton
        label="Cancelar Gestión"
        variant="secondary"
        onClick={handleCancelar}
      />
    );

    return () => {
      setHeaderActions(null);
    };
  }, [handleCancelar, setHeaderActions]);

  const handleGestionSubmit = useCallback(
    (
      _data: GestionFormClaro,
      fechaFinGestion: string
    ) => {
      setGestionRealizadaRefreshKey(
        (current) => current + 1
      );

      setTelefonoSeleccionado('');
      onGestionRegistrada(
        fechaFinGestion
      );
    },
    [onGestionRegistrada]
  );

  const handleGestionGuardada = useCallback(
    (gestionTerminada: boolean) => {
      if (!gestionTerminada) {
        return;
      }

      goToGestionDeudor();
    },
    [goToGestionDeudor]
  );

  const handleTogglePanel = useCallback(
    (accion: FichaDeudorPanel) => {
      setPanelActivo((actual) =>
        actual === accion ? null : accion
      );
    },
    []
  );

  return {
    contacto,
    setContacto,
    panelActivo,
    telefonoSeleccionado,
    setTelefonoSeleccionado,
    documentosFiltrados,
    setDocumentosFiltrados,
    gestionRealizadaRefreshKey,
    deudorData,
    cabeceraData,
    isLoadingCabecera,
    cabeceraError,
    handleGestionSubmit,
    handleGestionGuardada,
    handleTogglePanel,
  };
};