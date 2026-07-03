import React, { useEffect, useRef, useState } from 'react';
import { PanelLayout } from './PanelLayout';
import { useGestionesRealizadas } from '../../hooks/useGestionesRealizadas';
import { usePanelGestionRealizadaColumns } from '../../hooks/usePanelGestionRealizadaColumns';
import { usePanelGestionRealizadaActions } from '../../hooks/usePanelGestionRealizadaActions';
import PanelTablaResumen from './shared/PanelTablaResumen';
import PanelTablaExpandida from './shared/PanelTablaExpandida';
import PanelResumenEstado from './shared/PanelResumenEstado';

interface Props {
  isActive: boolean;
  id_cliente: string;
  id_cartera: string;
  id_deudor: string;
  id_usuario: string;
  refreshKey?: number;
}

const PanelGestionRealizada: React.FC<Props> = ({
  isActive,
  id_cliente,
  id_cartera,
  id_deudor,
  id_usuario,
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
    setResumido,
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
  } = useGestionesRealizadas(
    id_cliente,
    id_cartera,
    id_deudor,
    id_usuario
  );

  const [vistaExpandida, setVistaExpandida] = useState(false);
  const lastRefreshKeyRef = useRef(refreshKey);

  useEffect(() => {
    if (refreshKey === 0 || refreshKey === lastRefreshKeyRef.current) {
      return;
    }

    lastRefreshKeyRef.current = refreshKey;

    void refetch();
    void refetchCompleto();
  }, [refreshKey, refetch, refetchCompleto]);

  const { handleVerMas, handleVolver, handleEliminar } =
    usePanelGestionRealizadaActions({
      setVistaExpandida,
      setResumido,
    });

  const { columnsResumidas, columnsExpandidas } =
    usePanelGestionRealizadaColumns({
      onEliminar: handleEliminar,
    });

  if (!isActive) return null;

  if (!vistaExpandida && (isLoading || error)) {
    return (
      <PanelResumenEstado
        title="GESTIÓN REALIZADA"
        isActive={isActive}
        error={error}
        loadingMessage="Cargando gestiones..."
        errorTitle="Error al cargar gestiones:"
        onRetry={refetch}
      />
    );
  }

  return (
    <PanelLayout title="GESTIÓN REALIZADA" isActive={isActive}>
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
          emptyMessage="No se encontraron gestiones realizadas"
          itemLabel="gestión(es)"
          verMasLabel="Ver más gestiones realizadas"
          pageSizeOptions={[5, 10, 20, 50]}
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
          emptyMessage="No se encontraron gestiones realizadas"
          itemLabel="gestión(es)"
          loadingMessage="Cargando gestiones..."
          errorTitle="Error al cargar gestiones:"
          pageSizeOptions={[5, 10, 30, 50]}
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