import React from 'react';

import { useFichaDeudorParams } from '../hooks/useFichaDeudorParams';
import { useFichaDeudorPage } from '../hooks/useFichaDeudorPage';
import DeudorHeader from '../components/ficha/DeudorHeader';
import AccionesRapidas from '../components/ficha/AccionesRapidas';
import DocumentosTable from '../components/ficha/DocumentosTable';
import FichaGestion from '../components/ficha/FichaGestion';
import PanelDatosAdicionales from '../components/paneles/PanelDatosAdicionales';
import PanelTelefonosReferenciados from '../components/paneles/PanelTelefonosReferenciados';
import PanelDireccionesReferenciadas from '../components/paneles/PanelDireccionesReferenciadas';
import PanelEstadoGestionRealizada from '../components/paneles/PanelEstadoGestionRealizada';
import PanelGestionRealizada from '../components/paneles/PanelGestionRealizada';
import { DeudorProvider } from '../contexts/DeudorContext';
import { FICHA_DEUDOR_PANEL } from '../constants/fichaDeudorPanels.constants';

interface FichaContentProps {
  id_cliente: string;
  id_cartera: string;
  id_deudor: string;
  id_contrato: string;
  id_usuario: string;
  fecha_inicio_gestion: string;
}

const FichaContent: React.FC<FichaContentProps> = ({
  id_cliente,
  id_cartera,
  id_deudor,
  id_contrato,
  id_usuario,
  fecha_inicio_gestion,
}) => {
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
  } = useFichaDeudorPage({
    id_cliente,
    id_cartera,
    id_deudor,
    id_contrato,
    id_usuario,
  });

  return (
    <DeudorProvider value={deudorData ?? null}>
      <div className="ficha-page">
        <main className="ficha-main ficha-main--two-columns">
          <aside className="ficha-sidebar">
            {deudorData && (
              <DeudorHeader
                id_cliente={id_cliente}
                id_cartera={id_cartera}
                id_deudor={id_deudor}
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
                id_cliente={id_cliente}
                id_cartera={id_cartera}
                id_deudor={id_deudor}
                id_contrato={id_contrato}
                id_usuario={id_usuario}
                data={deudorData}
                onFilteredDocumentosChange={setDocumentosFiltrados}
              />
            )}

            <PanelDatosAdicionales
              isActive={panelActivo === FICHA_DEUDOR_PANEL.DATOS_ADICIONALES}
              id_cliente={id_cliente}
              id_cartera={id_cartera}
              id_deudor={id_deudor}
            />

            <PanelTelefonosReferenciados
              isActive={
                panelActivo === FICHA_DEUDOR_PANEL.TELEFONOS_REFERENCIADOS
              }
              id_cliente={id_cliente}
              id_deudor={id_deudor}
              id_usuario={id_usuario}
              onSelectTelefono={setTelefonoSeleccionado}
            />

            <PanelDireccionesReferenciadas
              isActive={
                panelActivo === FICHA_DEUDOR_PANEL.DIRECCIONES_REFERENCIADAS
              }
              id_cliente={id_cliente}
              id_deudor={id_deudor}
              id_usuario={id_usuario}
            />

            <PanelGestionRealizada
              isActive={panelActivo === FICHA_DEUDOR_PANEL.GESTION_REALIZADA}
              id_cliente={id_cliente}
              id_cartera={id_cartera}
              id_deudor={id_deudor}
              id_usuario={id_usuario}
              refreshKey={gestionRealizadaRefreshKey}
            />

            <PanelEstadoGestionRealizada
              isActive={
                panelActivo === FICHA_DEUDOR_PANEL.ESTADO_GESTION_REALIZADA
              }
              id_cliente={id_cliente}
              id_cartera={id_cartera}
              id_deudor={id_deudor}
            />

            <FichaGestion
              onSubmit={handleGestionSubmit}
              idCliente={id_cliente}
              idCartera={id_cartera}
              idContrato={id_contrato}
              idDeudor={id_deudor}
              idUsuario={id_usuario}
              fechaInicioGestion={fecha_inicio_gestion}
              documentosFiltrados={documentosFiltrados}
              telefonoSeleccionado={telefonoSeleccionado}
              onGestionGuardada={handleGestionGuardada}
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

  const {
    id_cliente,
    id_cartera,
    id_deudor,
    id_contrato,
    id_usuario,
    fecha_inicio_gestion,
  } = params;

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

  return (
    <FichaContent
      id_cliente={id_cliente}
      id_cartera={id_cartera}
      id_deudor={id_deudor}
      id_contrato={id_contrato}
      id_usuario={id_usuario}
      fecha_inicio_gestion={fecha_inicio_gestion}
    />
  );
};

export default FichaDeudor;