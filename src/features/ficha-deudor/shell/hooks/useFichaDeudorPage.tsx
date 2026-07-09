import type { FichaDeudorPanel } from '../constants/fichaDeudorPanels.constants';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FichaDeudorIdentityParams } from '../../shared/types/fichaDeudor.types';
import { ActionButton } from '@shared/components/ui/ActionButton';
import { useAppLayout } from '@shared/components/layout/AppLayoutContext';
import type { DocumentoApi } from '../../shared/types';
import { useDeudorHeader } from '../../modules/deudor-header/hooks/useDeudorHeader';

type UseFichaDeudorPageParams = FichaDeudorIdentityParams;

export const useFichaDeudorPage = ({
  id_cliente,
  id_cartera,
  id_deudor,
  id_usuario,
}: UseFichaDeudorPageParams) => {
  const navigate = useNavigate();
  const { setHeaderActions } = useAppLayout();

  const [contacto, setContacto] = useState('');
  const [panelActivo, setPanelActivo] = useState<FichaDeudorPanel | null>(null);
  const [telefonoSeleccionado, setTelefonoSeleccionado] = useState('');
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

  const goToDashboard = useCallback(() => {
    const queryParams = new URLSearchParams({
      id_cliente,
      id_usuario,
    });

    navigate(`/dashboard?${queryParams.toString()}`, { replace: true });
  }, [id_cliente, id_usuario, navigate]);

  const handleCancelar = useCallback(() => {
    goToDashboard();
  }, [goToDashboard]);

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

  const handleGestionSubmit = useCallback(() => {
    setGestionRealizadaRefreshKey((current) => current + 1);
    setTelefonoSeleccionado('');
  }, []);

  const handleGestionGuardada = useCallback(
    (gestionTerminada: boolean) => {
      if (!gestionTerminada) return;

      goToDashboard();
    },
    [goToDashboard]
  );

  const handleTogglePanel = useCallback((accion: FichaDeudorPanel) => {
    setPanelActivo((actual: FichaDeudorPanel | null) => (actual === accion ? null : accion));
  }, []);

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
    handleGestionSubmit,
    handleGestionGuardada,
    handleTogglePanel,
  };
};