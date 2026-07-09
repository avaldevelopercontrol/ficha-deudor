import React from 'react';

import {
  PANEL_DIRECCIONES_REFERENCIADAS_MESSAGES,
  PANEL_DIRECCIONES_REFERENCIADAS_TITLE,
} from '../constants/panelDireccionesReferenciadas.constants';
import { usePanelDireccionesReferenciadasViewModel } from '../hooks/usePanelDireccionesReferenciadasViewModel';
import type { FichaDeudorReferenciaPanelParams } from '../../../shared/types/fichaDeudor.types';
import ModalEditarDireccion from './ModalEditarDireccion';
import ModalRegistrarDireccion from './ModalRegistrarDireccion';
import { PanelLayout } from '../../../shared/components/panels/PanelLayout';
import PanelResumenEstado from '../../../shared/components/panels/PanelResumenEstado';
import PanelTablaHeaderActions from '../../../shared/components/panels/PanelTablaHeaderActions';
import PanelTablaResumen from '../../../shared/components/panels/PanelTablaResumen';

interface Props {
  isActive: boolean;
  params: FichaDeudorReferenciaPanelParams;
}

const PanelDireccionesReferenciadas: React.FC<Props> = ({
  isActive,
  params,
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
    direccionEditarId,
    direccionByIdData,
    handleOpenRegistrar,
    handleCloseRegistrar,
    handleCloseEditar,
    handleGuardarEdicion,
    handleRegistrar,
    columns,
  } = usePanelDireccionesReferenciadasViewModel({ params });

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