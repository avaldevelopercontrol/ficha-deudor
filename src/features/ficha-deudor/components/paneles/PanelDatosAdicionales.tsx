import React from 'react';
import { PanelLayout } from './PanelLayout';
import { useDatosAdicionales } from '../../hooks/useDatosAdicionales';
import { usePanelDatosAdicionalesColumns } from '../../hooks/usePanelDatosAdicionalesColumns';
import {
  PANEL_DATOS_ADICIONALES_MESSAGES,
  PANEL_DATOS_ADICIONALES_NIVEL,
  PANEL_DATOS_ADICIONALES_PAGE_SIZE_OPTIONS,
  PANEL_DATOS_ADICIONALES_TITLE,
} from '../../constants/panelDatosAdicionales.constants';
import PanelResumenEstado from './shared/PanelResumenEstado';
import PanelTablaResumen from './shared/PanelTablaResumen';

interface Props {
  isActive: boolean;
  id_cliente: string;
  id_cartera: string;
  id_deudor: string;
}

const PanelDatosAdicionales: React.FC<Props> = ({
  isActive,
  id_cliente,
  id_cartera,
  id_deudor,
}) => {
  const {
    columns,
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
  } = useDatosAdicionales(
    id_cliente,
    id_cartera,
    id_deudor,
    PANEL_DATOS_ADICIONALES_NIVEL
  );

  const { tableColumns } = usePanelDatosAdicionalesColumns(columns);

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