import React from 'react';

import {
  OperationFeedbackMessage,
} from '@shared/components/ui';

import {
  PANEL_TELEFONOS_REFERENCIADOS_MESSAGES,
  PANEL_TELEFONOS_REFERENCIADOS_TITLE,
} from '../constants/panelTelefonosReferenciados.constants';
import { usePanelTelefonosReferenciadosViewModel } from '../hooks/usePanelTelefonosReferenciadosViewModel';
import ModalEditarTelefono from './ModalEditarTelefono';
import ModalRegistrarTelefono from './ModalRegistrarTelefono';
import { PanelLayout } from '../../../shared/components/panels/PanelLayout';
import PanelResumenEstado from '../../../shared/components/panels/PanelResumenEstado';
import PanelTablaHeaderActions from '../../../shared/components/panels/PanelTablaHeaderActions';
import PanelTablaResumen from '../../../shared/components/panels/PanelTablaResumen';
import type { UseTelefonosReferenciadosReturn } from '../hooks/useTelefonosReferenciados';

interface Props {
  isActive: boolean;
  resource:
    UseTelefonosReferenciadosReturn;
  onSelectTelefono: (
    telefono: string
  ) => void;
}

const PanelTelefonosReferenciados: React.FC<
  Props
> = ({
  isActive,
  resource,
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
    feedback,
    clearFeedback,
    showRegistrar,
    showEditar,
    telefonoEditarId,
    handleOpenRegistrar,
    handleCloseRegistrar,
    handleCloseEditar,
    handleGuardarEdicion,
    handleRegistrar,
    columns,
  } = usePanelTelefonosReferenciadosViewModel({
    resource,
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
        <OperationFeedbackMessage
          feedback={feedback}
          onClose={clearFeedback}
        />

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

      {showRegistrar && (
        <ModalRegistrarTelefono
          isOpen
          onClose={handleCloseRegistrar}
          telefonosExistentes={allData}
          onRegistrar={handleRegistrar}
        />
      )}

      {showEditar && (
        <ModalEditarTelefono
          isOpen
          onClose={handleCloseEditar}
          telefonoId={telefonoEditarId}
          telefonosExistentes={allData}
          onGuardar={handleGuardarEdicion}
        />
      )}
    </>
  );
};

export default PanelTelefonosReferenciados;
