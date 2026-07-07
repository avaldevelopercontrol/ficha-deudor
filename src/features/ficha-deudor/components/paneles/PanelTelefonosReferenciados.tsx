import React from 'react';
import { PanelLayout } from './PanelLayout';
import { useTelefonosReferenciados } from '../../hooks/useTelefonosReferenciados';
import { usePanelTelefonosReferenciadosColumns } from '../../hooks/usePanelTelefonosReferenciadosColumns';
import { usePanelTelefonosReferenciadosActions } from '../../hooks/usePanelTelefonosReferenciadosActions';
import {
  PANEL_TELEFONOS_REFERENCIADOS_MESSAGES,
  PANEL_TELEFONOS_REFERENCIADOS_TITLE,
} from '../../constants/panelTelefonosReferenciados.constants';
import ModalRegistrarTelefono from '../modals/accionesRapidas/ModalRegistrarTelefono';
import ModalEditarTelefono from '../modals/accionesRapidas/ModalEditarTelefono';
import PanelTablaResumen from './shared/PanelTablaResumen';
import PanelResumenEstado from './shared/PanelResumenEstado';
import PanelTablaHeaderActions from './shared/PanelTablaHeaderActions';

interface Props {
  isActive: boolean;
  id_cliente: string;
  id_deudor: string;
  id_usuario: string;
  onSelectTelefono?: (telefono: string) => void;
}

const PanelTelefonosReferenciados: React.FC<Props> = ({
  isActive,
  id_cliente,
  id_deudor,
  id_usuario,
  onSelectTelefono,
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
  } = useTelefonosReferenciados(id_cliente, id_deudor, id_usuario);

  const {
    showRegistrar,
    showEditar,
    telefonoEditarId,
    handleOpenRegistrar,
    handleCloseRegistrar,
    handleEdit,
    handleCloseEditar,
    handleGuardarEdicion,
    handleRegistrar,
  } = usePanelTelefonosReferenciadosActions({
    create,
    update,
  });

  const { columns } = usePanelTelefonosReferenciadosColumns({
    onEdit: handleEdit,
    onSelectTelefono,
  });

  if (!isActive) return null;

  if (isLoading || error) {
    return (
      <PanelResumenEstado
        title={PANEL_TELEFONOS_REFERENCIADOS_TITLE}
        isActive={isActive}
        error={error}
        loadingMessage={PANEL_TELEFONOS_REFERENCIADOS_MESSAGES.LOADING}
        errorTitle={PANEL_TELEFONOS_REFERENCIADOS_MESSAGES.ERROR_TITLE}
        onRetry={refetch}
      />
    );
  }

  return (
    <>
      <PanelLayout
        title={PANEL_TELEFONOS_REFERENCIADOS_TITLE}
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
          emptyMessage={PANEL_TELEFONOS_REFERENCIADOS_MESSAGES.EMPTY}
          itemLabel={PANEL_TELEFONOS_REFERENCIADOS_MESSAGES.ITEM_LABEL}
          setPageNumber={setPageNumber}
          setPageSize={setPageSize}
          fitToPanel
          onTextFilterChange={onTextFilterChange}
          onSelectedFilterChange={onSelectedFilterChange}
          headerRight={
            <PanelTablaHeaderActions
              pageNumber={pageNumber}
              totalPages={totalPages}
              buttonLabel={PANEL_TELEFONOS_REFERENCIADOS_MESSAGES.ADD_BUTTON}
              onAdd={handleOpenRegistrar}
            />
          }
        />
      </PanelLayout>

      <ModalRegistrarTelefono
        isOpen={showRegistrar}
        onClose={handleCloseRegistrar}
        onRegistrar={handleRegistrar}
      />

      <ModalEditarTelefono
        isOpen={showEditar}
        onClose={handleCloseEditar}
        telefonoId={telefonoEditarId}
        onGuardar={handleGuardarEdicion}
      />
    </>
  );
};

export default PanelTelefonosReferenciados;