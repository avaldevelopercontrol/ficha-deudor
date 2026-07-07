import React from 'react';
import ModalRegistrarDireccion from '../modals/accionesRapidas/ModalRegistrarDireccion';
import ModalEditarDireccion from '../modals/accionesRapidas/ModalEditarDireccion';
import { PanelLayout } from './PanelLayout';
import { useDireccionesReferenciadas } from '../../hooks/useDireccionesReferenciadas';
import { usePanelDireccionesReferenciadasColumns } from '../../hooks/usePanelDireccionesReferenciadasColumns';
import { usePanelDireccionesReferenciadasActions } from '../../hooks/usePanelDireccionesReferenciadasActions';
import {
  PANEL_DIRECCIONES_REFERENCIADAS_MESSAGES,
  PANEL_DIRECCIONES_REFERENCIADAS_TITLE,
} from '../../constants/panelDireccionesReferenciadas.constants';
import PanelTablaResumen from './shared/PanelTablaResumen';
import PanelResumenEstado from './shared/PanelResumenEstado';
import PanelTablaHeaderActions from './shared/PanelTablaHeaderActions';

interface Props {
  isActive: boolean;
  id_cliente: string;
  id_deudor: string;
  id_usuario: string;
}

const PanelDireccionesReferenciadas: React.FC<Props> = ({
  isActive,
  id_cliente,
  id_deudor,
  id_usuario,
}) => {
  const {
    allData,
    paginatedData,
    isLoading,
    error,
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
    setPageNumber,
    setPageSize,
    refetch,
    textFilters,
    selectedFilters,
    onTextFilterChange,
    onSelectedFilterChange,
    create,
    update,
  } = useDireccionesReferenciadas(id_cliente, id_deudor, id_usuario);

  const {
    showRegistrar,
    showEditar,
    direccionEditarId,
    direccionByIdData,
    handleOpenRegistrar,
    handleCloseRegistrar,
    handleEdit,
    handleCloseEditar,
    handleGuardarEdicion,
    handleRegistrar,
  } = usePanelDireccionesReferenciadasActions({
    create,
    update,
  });

  const { columns } = usePanelDireccionesReferenciadasColumns({
    onEdit: handleEdit,
  });

  if (!isActive) return null;

  if (isLoading || error) {
    return (
      <PanelResumenEstado
        title={PANEL_DIRECCIONES_REFERENCIADAS_TITLE}
        isActive={isActive}
        error={error}
        loadingMessage={PANEL_DIRECCIONES_REFERENCIADAS_MESSAGES.LOADING}
        errorTitle={PANEL_DIRECCIONES_REFERENCIADAS_MESSAGES.ERROR_TITLE}
        onRetry={refetch}
      />
    );
  }

  return (
    <>
      <PanelLayout
        title={PANEL_DIRECCIONES_REFERENCIADAS_TITLE}
        isActive={isActive}
      >
        <PanelTablaResumen
          columns={columns}
          data={paginatedData}
          allData={allData}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalRecords={totalRecords}
          totalPages={totalPages}
          textFilters={textFilters}
          selectedFilters={selectedFilters}
          emptyMessage={PANEL_DIRECCIONES_REFERENCIADAS_MESSAGES.EMPTY}
          itemLabel={PANEL_DIRECCIONES_REFERENCIADAS_MESSAGES.ITEM_LABEL}
          setPageNumber={setPageNumber}
          setPageSize={setPageSize}
          fitToPanel
          onTextFilterChange={onTextFilterChange}
          onSelectedFilterChange={onSelectedFilterChange}
          headerRight={
            <PanelTablaHeaderActions
              pageNumber={pageNumber}
              totalPages={totalPages}
              buttonLabel={PANEL_DIRECCIONES_REFERENCIADAS_MESSAGES.ADD_BUTTON}
              onAdd={handleOpenRegistrar}
            />
          }
        />
      </PanelLayout>

      <ModalRegistrarDireccion
        isOpen={showRegistrar}
        onClose={handleCloseRegistrar}
        onRegistrar={handleRegistrar}
      />

      <ModalEditarDireccion
        isOpen={showEditar}
        onClose={handleCloseEditar}
        direccionId={direccionEditarId}
        direccionData={direccionByIdData}
        onGuardar={handleGuardarEdicion}
      />
    </>
  );
};

export default PanelDireccionesReferenciadas;