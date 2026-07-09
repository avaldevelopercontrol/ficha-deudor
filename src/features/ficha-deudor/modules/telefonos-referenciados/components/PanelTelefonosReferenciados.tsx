import React from 'react';

import {
  PANEL_TELEFONOS_REFERENCIADOS_MESSAGES,
  PANEL_TELEFONOS_REFERENCIADOS_TITLE,
} from '../constants/panelTelefonosReferenciados.constants';
import { usePanelTelefonosReferenciadosViewModel } from '../hooks/usePanelTelefonosReferenciadosViewModel';
import type { FichaDeudorReferenciaPanelParams } from '../../../shared/types/fichaDeudor.types';
import ModalEditarTelefono from './ModalEditarTelefono';
import ModalRegistrarTelefono from './ModalRegistrarTelefono';
import { PanelLayout } from '../../../shared/components/panels/PanelLayout';
import PanelResumenEstado from '../../../shared/components/panels/PanelResumenEstado';
import PanelTablaHeaderActions from '../../../shared/components/panels/PanelTablaHeaderActions';
import PanelTablaResumen from '../../../shared/components/panels/PanelTablaResumen';

interface Props {
  isActive: boolean;
  params: FichaDeudorReferenciaPanelParams;
  onSelectTelefono?: (telefono: string) => void;
}

const PanelTelefonosReferenciados: React.FC<Props> = ({
  isActive,
  params,
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
    params,
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