import React from 'react';

import {
  PANEL_DATOS_ADICIONALES_MESSAGES,
  PANEL_DATOS_ADICIONALES_PAGE_SIZE_OPTIONS,
  PANEL_DATOS_ADICIONALES_TITLE,
} from '../constants/panelDatosAdicionales.constants';
import { usePanelDatosAdicionalesViewModel } from '../hooks/usePanelDatosAdicionalesViewModel';
import type { FichaDeudorCarteraPanelParams } from '../../../shared/types/fichaDeudor.types';
import { PanelLayout } from '../../../shared/components/panels/PanelLayout';
import PanelResumenEstado from '../../../shared/components/panels/PanelResumenEstado';
import PanelTablaResumen from '../../../shared/components/panels/PanelTablaResumen';

interface Props {
  isActive: boolean;
  params: FichaDeudorCarteraPanelParams;
}

const PanelDatosAdicionales: React.FC<Props> = ({ isActive, params }) => {
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
    tableColumns,
  } = usePanelDatosAdicionalesViewModel({ params });

  if (!isActive) return null;

  if (isLoading || error) {
    return (
      <PanelResumenEstado
        title={PANEL_DATOS_ADICIONALES_TITLE}
        isActive={isActive}
        error={error}
        loadingMessage={PANEL_DATOS_ADICIONALES_MESSAGES.LOADING}
        errorTitle={PANEL_DATOS_ADICIONALES_MESSAGES.ERROR_TITLE}
        onRetry={refetch}
      />
    );
  }

  return (
    <PanelLayout title={PANEL_DATOS_ADICIONALES_TITLE} isActive={isActive}>
      <PanelTablaResumen
        columns={tableColumns}
        data={paginatedData}
        allData={allData}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalRecords={totalRecords}
        totalPages={totalPages}
        textFilters={textFilters}
        selectedFilters={selectedFilters}
        emptyMessage={PANEL_DATOS_ADICIONALES_MESSAGES.EMPTY}
        pageSizeOptions={PANEL_DATOS_ADICIONALES_PAGE_SIZE_OPTIONS}
        showCount={false}
        fitToPanel
        setPageNumber={setPageNumber}
        setPageSize={setPageSize}
        onTextFilterChange={onTextFilterChange}
        onSelectedFilterChange={onSelectedFilterChange}
      />
    </PanelLayout>
  );
};

export default PanelDatosAdicionales;