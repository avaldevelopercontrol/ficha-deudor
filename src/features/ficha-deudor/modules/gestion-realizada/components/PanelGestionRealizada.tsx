import React from 'react';

import {
  PANEL_GESTION_REALIZADA_MESSAGES,
  PANEL_GESTION_REALIZADA_PAGE_SIZE_OPTIONS,
  PANEL_GESTION_REALIZADA_TITLE,
} from '../constants/panelGestionRealizada.constants';
import { usePanelGestionRealizadaViewModel } from '../hooks/usePanelGestionRealizadaViewModel';
import type { FichaDeudorGestionPanelParams } from '../../../shared/types/fichaDeudor.types';
import { PanelLayout } from '../../../shared/components/panels/PanelLayout';
import PanelResumenEstado from '../../../shared/components/panels/PanelResumenEstado';
import PanelTablaExpandida from '../../../shared/components/panels/PanelTablaExpandida';
import PanelTablaResumen from '../../../shared/components/panels/PanelTablaResumen';

interface Props {
  isActive: boolean;
  params: FichaDeudorGestionPanelParams;
  refreshKey?: number;
}

const PanelGestionRealizada: React.FC<Props> = ({
  isActive,
  params,
  refreshKey = 0,
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
    completo,
    completoLoading,
    completoError,
    completoPageNumber,
    completoPageSize,
    completoTotalRecords,
    completoTotalPages,
    setCompletoPageNumber,
    setCompletoPageSize,
    refetchCompleto,
    vistaExpandida,
    handleVerMas,
    handleVolver,
    columnsResumidas,
    columnsExpandidas,
  } = usePanelGestionRealizadaViewModel({
    params,
    refreshKey,
  });

  if (!isActive) return null;

  if (!vistaExpandida && (isLoading || error)) {
    return (
      <PanelResumenEstado
        title={PANEL_GESTION_REALIZADA_TITLE}
        isActive={isActive}
        error={error}
        loadingMessage={PANEL_GESTION_REALIZADA_MESSAGES.LOADING}
        errorTitle={PANEL_GESTION_REALIZADA_MESSAGES.ERROR_TITLE}
        onRetry={refetch}
      />
    );
  }

  return (
    <PanelLayout title={PANEL_GESTION_REALIZADA_TITLE} isActive={isActive}>
      {!vistaExpandida ? (
        <PanelTablaResumen
          columns={columnsResumidas}
          data={paginatedData}
          allData={allData}
          pageNumber={pageNumber}
          pageSize={pageSize}
          totalRecords={totalRecords}
          totalPages={totalPages}
          textFilters={textFilters}
          selectedFilters={selectedFilters}
          emptyMessage={PANEL_GESTION_REALIZADA_MESSAGES.EMPTY}
          itemLabel={PANEL_GESTION_REALIZADA_MESSAGES.ITEM_LABEL}
          verMasLabel={PANEL_GESTION_REALIZADA_MESSAGES.VER_MAS}
          pageSizeOptions={PANEL_GESTION_REALIZADA_PAGE_SIZE_OPTIONS.RESUMEN}
          fitToPanel
          setPageNumber={setPageNumber}
          setPageSize={setPageSize}
          onTextFilterChange={onTextFilterChange}
          onSelectedFilterChange={onSelectedFilterChange}
          onVerMas={handleVerMas}
        />
      ) : (
        <PanelTablaExpandida
          columns={columnsExpandidas}
          data={completo}
          isLoading={completoLoading}
          error={completoError}
          pageNumber={completoPageNumber}
          pageSize={completoPageSize}
          totalRecords={completoTotalRecords}
          totalPages={completoTotalPages}
          emptyMessage={PANEL_GESTION_REALIZADA_MESSAGES.EMPTY}
          itemLabel={PANEL_GESTION_REALIZADA_MESSAGES.ITEM_LABEL}
          loadingMessage={PANEL_GESTION_REALIZADA_MESSAGES.LOADING}
          errorTitle={PANEL_GESTION_REALIZADA_MESSAGES.ERROR_TITLE}
          pageSizeOptions={PANEL_GESTION_REALIZADA_PAGE_SIZE_OPTIONS.EXPANDIDA}
          showPageSizeSelector
          fitToPanel
          setPageNumber={setCompletoPageNumber}
          setPageSize={setCompletoPageSize}
          onRetry={refetchCompleto}
          onVolver={handleVolver}
        />
      )}
    </PanelLayout>
  );
};

export default PanelGestionRealizada;