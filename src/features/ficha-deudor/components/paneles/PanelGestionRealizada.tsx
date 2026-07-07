import React, { useCallback, useState } from 'react';
import { PanelLayout } from './PanelLayout';
import { useGestionesRealizadas } from '../../hooks/useGestionesRealizadas';
import { usePanelGestionRealizadaColumns } from '../../hooks/usePanelGestionRealizadaColumns';
import { usePanelGestionRealizadaActions } from '../../hooks/usePanelGestionRealizadaActions';
import { useRefreshOnKeyChange } from '../../hooks/useRefreshOnKeyChange';
import {
  PANEL_GESTION_REALIZADA_MESSAGES,
  PANEL_GESTION_REALIZADA_PAGE_SIZE_OPTIONS,
  PANEL_GESTION_REALIZADA_TITLE,
} from '../../constants/panelGestionRealizada.constants';
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

  const handleRefreshPanel = useCallback(() => {
    void refetch();
    void refetchCompleto();
  }, [refetch, refetchCompleto]);

  useRefreshOnKeyChange({
    refreshKey,
    onRefresh: handleRefreshPanel,
  });

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