import React, {
  useCallback,
  useState,
} from 'react';
import { Navigate } from 'react-router-dom';

import { AUTH_ROUTES } from '@features/auth/constants';

import DeudorHeader from '../modules/deudor-header/components/DeudorHeader';
import DocumentosTable from '../modules/documentos/components/DocumentosTable';
import FichaGestion from '../modules/gestion/components/FichaGestion';
import PanelDatosAdicionales from '../modules/datos-adicionales/components/PanelDatosAdicionales';
import PanelTelefonosReferenciados from '../modules/telefonos-referenciados/components/PanelTelefonosReferenciados';
import PanelDireccionesReferenciadas from '../modules/direcciones-referenciadas/components/PanelDireccionesReferenciadas';
import PanelEstadoGestionRealizada from '../modules/estado-gestion-realizada/components/PanelEstadoGestionRealizada';
import PanelGestionRealizada from '../modules/gestion-realizada/components/PanelGestionRealizada';
import type { TelefonosReferenciadosResourceState } from '../modules/telefonos-referenciados/types/telefono.types';
import AccionesRapidas from '../shell/components/AccionesRapidas';
import { FICHA_DEUDOR_PANEL } from '../shell/constants/fichaDeudorPanels.constants';
import { useFichaDeudorPage } from '../shell/hooks/useFichaDeudorPage';
import { useFichaDeudorParams } from '../shell/hooks/useFichaDeudorParams';

import { DeudorProvider } from '../shared/contexts/DeudorContext';
import type {
  FichaDeudorCarteraPanelParams,
  FichaDeudorDocumentosParams,
  FichaDeudorGestionPanelParams,
  FichaDeudorParams,
  FichaDeudorReferenciaPanelParams,
} from '../shared/types/fichaDeudor.types';

interface FichaContentProps {
  params: FichaDeudorParams;
  onGestionRegistrada: (
    fechaFinGestion: string
  ) => void;
}

const FichaContent: React.FC<
  FichaContentProps
> = ({
  params,
  onGestionRegistrada,
}) => {
  const {
    id_cliente,
    id_cartera,
    id_deudor,
    id_contrato,
    id_usuario,
  } = params;

  const documentosParams: FichaDeudorDocumentosParams = {
    id_cliente,
    id_cartera,
    id_deudor,
    id_contrato,
    id_usuario,
  };

  const carteraPanelParams: FichaDeudorCarteraPanelParams = {
    id_cliente,
    id_cartera,
    id_deudor,
  };

  const referenciaPanelParams: FichaDeudorReferenciaPanelParams = {
    id_cliente,
    id_deudor,
    id_usuario,
  };

  const gestionPanelParams: FichaDeudorGestionPanelParams = {
    id_cliente,
    id_cartera,
    id_deudor,
    id_usuario,
  };

  const [
    telefonosReferenciadosResource,
    setTelefonosReferenciadosResource,
  ] = useState<TelefonosReferenciadosResourceState>({
    telefonos: [],
    isLoading: true,
    error: null,
  });

  const handleTelefonosReferenciadosResourceChange =
    useCallback(
      (
        resource: TelefonosReferenciadosResourceState
      ) => {
        setTelefonosReferenciadosResource(resource);
      },
      []
    );
  
  const {
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
  } = useFichaDeudorPage({
    ...params,
    onGestionRegistrada,
  });

  const deudorNombre =
    deudorData?.nombreRazonSocial ?? '';

  const carteraNombre =
    cabeceraData?.cartera ?? '';

  return (
    <DeudorProvider value={deudorData ?? null}>
      <div className="ficha-page">
        <main className="ficha-main ficha-main--two-columns">
          <aside className="ficha-sidebar">
            {deudorData && (
              <DeudorHeader
                deudorData={deudorData}
                cabeceraData={cabeceraData}
                isLoadingCabecera={isLoadingCabecera}
                cabeceraError={cabeceraError}
                contacto={contacto}
                onContactoChange={setContacto}
                compact
              />
            )}

            <AccionesRapidas
              panelActivo={panelActivo}
              onTogglePanel={handleTogglePanel}
            />
          </aside>

          <div className="ficha-content">
            {deudorData && (
              <DocumentosTable
                params={documentosParams}
                data={deudorData}
                onFilteredDocumentosChange={
                  setDocumentosFiltrados
                }
              />
            )}

            <PanelDatosAdicionales
              isActive={
                panelActivo ===
                FICHA_DEUDOR_PANEL.DATOS_ADICIONALES
              }
              params={carteraPanelParams}
            />

            <PanelTelefonosReferenciados
              isActive={
                panelActivo ===
                FICHA_DEUDOR_PANEL.TELEFONOS_REFERENCIADOS
              }
              params={referenciaPanelParams}
              onSelectTelefono={setTelefonoSeleccionado}
              onResourceChange={
                handleTelefonosReferenciadosResourceChange
              }
            />

            <PanelDireccionesReferenciadas
              isActive={
                panelActivo ===
                FICHA_DEUDOR_PANEL.DIRECCIONES_REFERENCIADAS
              }
              params={referenciaPanelParams}
            />

            <PanelGestionRealizada
              isActive={
                panelActivo ===
                FICHA_DEUDOR_PANEL.GESTION_REALIZADA
              }
              params={gestionPanelParams}
              refreshKey={
                gestionRealizadaRefreshKey
              }
            />

            <PanelEstadoGestionRealizada
              isActive={
                panelActivo ===
                FICHA_DEUDOR_PANEL.ESTADO_GESTION_REALIZADA
              }
              params={carteraPanelParams}
            />

            <FichaGestion
              params={params}
              documentosFiltrados={documentosFiltrados}
              deudorNombre={deudorNombre}
              carteraNombre={carteraNombre}
              telefonoSeleccionado={telefonoSeleccionado}
              telefonosReferenciados={
                telefonosReferenciadosResource.telefonos
              }
              isLoadingTelefonosReferenciados={
                telefonosReferenciadosResource.isLoading
              }
              telefonosReferenciadosError={
                telefonosReferenciadosResource.error
              }
              onSelectTelefono={setTelefonoSeleccionado}
              onGestionGuardada={handleGestionGuardada}
              onSubmit={handleGestionSubmit}
            />
          </div>
        </main>
      </div>
    </DeudorProvider>
  );
};

const FichaDeudor: React.FC = () => {
  const {
    params,
    hasRequiredParams,
    actualizarFechaInicioGestion,
  } = useFichaDeudorParams();

  if (!hasRequiredParams) {
    return (
      <Navigate
        to={AUTH_ROUTES.GESTION_DEUDOR}
        replace
      />
    );
  }

  return (
    <FichaContent
      params={params}
      onGestionRegistrada={
        actualizarFechaInicioGestion
      }
    />
  );
};

export default FichaDeudor;