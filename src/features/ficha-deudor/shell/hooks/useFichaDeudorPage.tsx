import { useCallback, useEffect, useState } from 'react';

import { ActionButton } from '@shared/components/ui/ActionButton';
import { useAppLayout } from '@shared/components/layout/AppLayoutContext';

import type { GestionFormClaro } from '../../modules/gestion/types/fichaGestionForm.types';
import {
  useCabeceraHeader,
  useDeudorHeader,
} from '../../modules/deudor-header/hooks/useDeudorHeader';
import { useTelefonosReferenciados } from '../../modules/telefonos-referenciados/hooks/useTelefonosReferenciados';
import type { DocumentoApi } from '../../shared/types';
import type { FichaDeudorIdentityParams } from '../../shared/types/fichaDeudor.types';
import { useFichaDeudorNavigation } from './useFichaDeudorNavigation';
import { useFichaDeudorPanels } from './useFichaDeudorPanels';

type UseFichaDeudorPageParams =
  FichaDeudorIdentityParams & {
    onGestionRegistrada: (
      fechaFinGestion: string
    ) => void;
  };

export const useFichaDeudorPage = ({
  id_cliente,
  id_cartera,
  id_deudor,
  id_usuario,
  onGestionRegistrada,
}: UseFichaDeudorPageParams) => {
  const { setHeaderActions } = useAppLayout();
  const {
    panelActivo,
    panelesInicializados,
    togglePanel: handleTogglePanel,
  } = useFichaDeudorPanels();
  const {
    handleCancelar,
    handleGestionGuardada,
  } = useFichaDeudorNavigation();

  const [telefonoSeleccionado, setTelefonoSeleccionado] =
    useState('');
  const [documentosFiltrados, setDocumentosFiltrados] = useState<
    DocumentoApi[]
  >([]);
  const [gestionRealizadaRefreshKey, setGestionRealizadaRefreshKey] =
    useState(0);

  const {
    data: deudorData,
    isLoading: isLoadingDeudor,
    error: deudorError,
    refetch: refetchDeudor,
  } = useDeudorHeader(
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

  const telefonosReferenciadosResource =
    useTelefonosReferenciados({
      id_cliente,
      id_deudor,
      id_usuario,
    });

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

  return {
    panelActivo,
    panelesInicializados,
    telefonoSeleccionado,
    setTelefonoSeleccionado,
    documentosFiltrados,
    setDocumentosFiltrados,
    gestionRealizadaRefreshKey,
    telefonosReferenciadosResource,
    deudorData,
    isLoadingDeudor,
    deudorError,
    refetchDeudor,
    cabeceraData,
    isLoadingCabecera,
    cabeceraError,
    handleGestionSubmit,
    handleGestionGuardada,
    handleTogglePanel,
  };
};
