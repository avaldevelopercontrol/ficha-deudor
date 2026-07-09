import React from 'react';

import { useFichaDeudorParams } from '../shell/hooks/useFichaDeudorParams';
import { useFichaDeudorPage } from '../shell/hooks/useFichaDeudorPage';
import DeudorHeader from '../modules/deudor-header/components/DeudorHeader';
import AccionesRapidas from '../shell/components/AccionesRapidas';
import DocumentosTable from '../modules/documentos/components/DocumentosTable';
import FichaGestion from '../modules/gestion/components/FichaGestion';
import PanelDatosAdicionales from '../modules/datos-adicionales/components/PanelDatosAdicionales';
import PanelTelefonosReferenciados from '../modules/telefonos-referenciados/components/PanelTelefonosReferenciados';
import PanelDireccionesReferenciadas from '../modules/direcciones-referenciadas/components/PanelDireccionesReferenciadas';
import PanelEstadoGestionRealizada from '../modules/estado-gestion-realizada/components/PanelEstadoGestionRealizada';
import PanelGestionRealizada from '../modules/gestion-realizada/components/PanelGestionRealizada';
import { DeudorProvider } from '../shared/contexts/DeudorContext';
import { FICHA_DEUDOR_PANEL } from '../shell/constants/fichaDeudorPanels.constants';
import type {
  FichaDeudorCarteraPanelParams,
  FichaDeudorDocumentosParams,
  FichaDeudorGestionPanelParams,
  FichaDeudorHeaderParams,
  FichaDeudorParams,
  FichaDeudorReferenciaPanelParams,
} from '../shared/types/fichaDeudor.types';

interface FichaContentProps {
  params: FichaDeudorParams;
}

const FichaContent: React.FC<FichaContentProps> = ({ params }) => {
  const {
    id_cliente,
    id_cartera,
    id_deudor,
    id_contrato,
    id_usuario,
  } = params;

  const headerParams: FichaDeudorHeaderParams = {
    id_cliente,
    id_cartera,
    id_deudor,
  };

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
    handleGestionSubmit,
    handleGestionGuardada,
    handleTogglePanel,
  } = useFichaDeudorPage(params);

  return (
    <DeudorProvider value={deudorData ?? null}>
      <div className="ficha-page">
        <main className="ficha-main ficha-main--two-columns">
          <aside className="ficha-sidebar">
            {deudorData && (
              <DeudorHeader
                params={headerParams}
                deudorData={deudorData}
                contacto={contacto}
                onContactoChange={setContacto}
                compact={true}
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
                onFilteredDocumentosChange={setDocumentosFiltrados}
              />
            )}

            <PanelDatosAdicionales
              isActive={panelActivo === FICHA_DEUDOR_PANEL.DATOS_ADICIONALES}
              params={carteraPanelParams}
            />

            <PanelTelefonosReferenciados
              isActive={
                panelActivo === FICHA_DEUDOR_PANEL.TELEFONOS_REFERENCIADOS
              }
              params={referenciaPanelParams}
              onSelectTelefono={setTelefonoSeleccionado}
            />

            <PanelDireccionesReferenciadas
              isActive={
                panelActivo === FICHA_DEUDOR_PANEL.DIRECCIONES_REFERENCIADAS
              }
              params={referenciaPanelParams}
            />

            <PanelGestionRealizada
              isActive={panelActivo === FICHA_DEUDOR_PANEL.GESTION_REALIZADA}
              params={gestionPanelParams}
              refreshKey={gestionRealizadaRefreshKey}
            />

            <PanelEstadoGestionRealizada
              isActive={
                panelActivo === FICHA_DEUDOR_PANEL.ESTADO_GESTION_REALIZADA
              }
              params={carteraPanelParams}
            />

            <FichaGestion
              params={params}
              documentosFiltrados={documentosFiltrados}
              telefonoSeleccionado={telefonoSeleccionado}
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
    missingParams,
    exampleUrl,
  } = useFichaDeudorParams();

  if (!hasRequiredParams) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error: Parámetros faltantes
          </h1>

          <p className="text-gray-700 mb-4">
            No se puede cargar la ficha del deudor porque faltan parámetros
            requeridos en la URL.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-sm text-red-700 font-semibold mb-2">
              Parámetros faltantes:
            </p>

            <ul className="list-disc list-inside text-sm text-red-700">
              {missingParams.map((param) => (
                <li key={param}>{param}</li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            Ejemplo de URL válida:
          </p>

          <code className="block bg-gray-100 text-gray-800 text-xs p-3 rounded overflow-x-auto">
            {exampleUrl}
          </code>
        </div>
      </div>
    );
  }

  return <FichaContent params={params} />;
};

export default FichaDeudor;