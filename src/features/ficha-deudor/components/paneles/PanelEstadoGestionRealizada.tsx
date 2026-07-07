import React, { useCallback, useState } from 'react';
import { PanelLayout } from './PanelLayout';
import { useEstadosGestion } from '../../hooks/useEstadosGestion';
import { usePanelEstadoGestionColumns } from '../../hooks/usePanelEstadoGestionColumns';
import {
  PANEL_ESTADO_GESTION_REALIZADA_EXPANDED_TITLE,
  PANEL_ESTADO_GESTION_REALIZADA_MESSAGES,
  PANEL_ESTADO_GESTION_REALIZADA_PAGE_SIZE_OPTIONS,
  PANEL_ESTADO_GESTION_REALIZADA_TITLE,
} from '../../constants/panelEstadoGestionRealizada.constants';
import PanelTablaResumen from './shared/PanelTablaResumen';
import PanelTablaExpandida from './shared/PanelTablaExpandida';
import PanelResumenEstado from './shared/PanelResumenEstado';

interface Props {
  isActive: boolean;
  id_cliente: string;
  id_cartera: string;
  id_deudor: string;
}

const PanelEstadoGestionRealizada: React.FC<Props> = ({
  isActive,
  id_cliente,
  id_cartera,
  id_deudor,
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
  } = useEstadosGestion(id_cliente, id_cartera, id_deudor);

  const [vistaExpandida, setVistaExpandida] = useState(false);

  const handleVerMas = useCallback(() => {
    setVistaExpandida(true);
  }, []);

  const handleVolver = useCallback(() => {
    setVistaExpandida(false);
  }, []);

  const { columnsResumidas, columnsExpandidas } =
    usePanelEstadoGestionColumns();

  if (!isActive) return null;

  if (!vistaExpandida && (isLoading || error)) {
    return (
      <PanelResumenEstado
        title={PANEL_ESTADO_GESTION_REALIZADA_TITLE}
        isActive={isActive}
        error={error}
        loadingMessage={PANEL_ESTADO_GESTION_REALIZADA_MESSAGES.LOADING}
        errorTitle={PANEL_ESTADO_GESTION_REALIZADA_MESSAGES.ERROR_TITLE}
        onRetry={refetch}
      />
    );
  }

  return (
    <PanelLayout
      title={
        vistaExpandida
          ? PANEL_ESTADO_GESTION_REALIZADA_EXPANDED_TITLE
          : PANEL_ESTADO_GESTION_REALIZADA_TITLE
      }
      isActive={isActive}
    >
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
          emptyMessage={PANEL_ESTADO_GESTION_REALIZADA_MESSAGES.EMPTY}
          itemLabel={PANEL_ESTADO_GESTION_REALIZADA_MESSAGES.ITEM_LABEL}
          verMasLabel={PANEL_ESTADO_GESTION_REALIZADA_MESSAGES.VER_MAS}
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
          emptyMessage={
            PANEL_ESTADO_GESTION_REALIZADA_MESSAGES.HISTORICAL_EMPTY
          }
          itemLabel={PANEL_ESTADO_GESTION_REALIZADA_MESSAGES.ITEM_LABEL}
          loadingMessage={
            PANEL_ESTADO_GESTION_REALIZADA_MESSAGES.HISTORICAL_LOADING
          }
          errorTitle={
            PANEL_ESTADO_GESTION_REALIZADA_MESSAGES.HISTORICAL_ERROR_TITLE
          }
          pageSizeOptions={PANEL_ESTADO_GESTION_REALIZADA_PAGE_SIZE_OPTIONS}
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

export default PanelEstadoGestionRealizada;