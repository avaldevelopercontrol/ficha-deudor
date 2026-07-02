import React from 'react';
import { PanelLayout } from './PanelLayout';
import { useDatosAdicionales } from '../../hooks/useDatosAdicionales';
import { usePanelDatosAdicionalesColumns } from '../../hooks/usePanelDatosAdicionalesColumns';
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
  } = useDatosAdicionales(id_cliente, id_cartera, id_deudor, 3);

  const { tableColumns } = usePanelDatosAdicionalesColumns(columns);

  if (!isActive) return null;

  if (isLoading || error) {
    return (
      <PanelResumenEstado
        title="DATOS ADICIONALES"
        isActive={isActive}
        error={error}
        loadingMessage="Cargando datos adicionales..."
        errorTitle="Error al cargar datos adicionales:"
        onRetry={refetch}
      />
    );
  }

  return (
    <PanelLayout title="DATOS ADICIONALES" isActive={isActive}>
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
        emptyMessage="No se encontraron datos adicionales"
        pageSizeOptions={[5, 10, 20, 50]}
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