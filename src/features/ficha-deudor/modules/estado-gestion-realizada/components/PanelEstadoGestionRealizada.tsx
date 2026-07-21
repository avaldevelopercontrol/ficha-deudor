import React from 'react';

import {
  PANEL_ESTADO_GESTION_REALIZADA_EXPANDED_TITLE,
  PANEL_ESTADO_GESTION_REALIZADA_MESSAGES,
  PANEL_ESTADO_GESTION_REALIZADA_PAGE_SIZE_OPTIONS,
  PANEL_ESTADO_GESTION_REALIZADA_TITLE,
} from '../constants/panelEstadoGestionRealizada.constants';

import { usePanelEstadoGestionRealizadaViewModel } from '../hooks/usePanelEstadoGestionRealizadaViewModel';

import type { FichaDeudorCarteraPanelParams } from '../../../shared/types/fichaDeudor.types';

import { PanelLayout } from '../../../shared/components/panels/PanelLayout';
import PanelResumenEstado from '../../../shared/components/panels/PanelResumenEstado';
import PanelTablaExpandida from '../../../shared/components/panels/PanelTablaExpandida';
import PanelTablaResumen from '../../../shared/components/panels/PanelTablaResumen';

interface Props {
  isActive: boolean;
  params: FichaDeudorCarteraPanelParams;
}

const PanelEstadoGestionRealizada: React.FC<
  Props
> = ({
  isActive,
  params,
}) => {
  const {
    /* Resumen */

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

    /* Histórico completo */

    completo,
    completoAllData,

    completoLoading,
    completoError,

    completoPageNumber,
    completoPageSize,
    completoTotalRecords,
    completoTotalPages,

    completoTextFilters,
    completoSelectedFilters,

    setCompletoPageNumber,
    setCompletoPageSize,

    onCompletoTextFilterChange,
    onCompletoSelectedFilterChange,

    refetchCompleto,

    /* Vista */

    vistaExpandida,
    handleVerMas,
    handleVolver,

    columnsResumidas,
    columnsExpandidas,
  } =
    usePanelEstadoGestionRealizadaViewModel({
      params,
    });

  if (!isActive) {
    return null;
  }

  if (
    !vistaExpandida &&
    (isLoading || error)
  ) {
    return (
      <PanelResumenEstado
        title={
          PANEL_ESTADO_GESTION_REALIZADA_TITLE
        }
        isActive={isActive}
        error={error}
        loadingMessage={
          PANEL_ESTADO_GESTION_REALIZADA_MESSAGES
            .LOADING
        }
        errorTitle={
          PANEL_ESTADO_GESTION_REALIZADA_MESSAGES
            .ERROR_TITLE
        }
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
          selectedFilters={
            selectedFilters
          }
          emptyMessage={
            PANEL_ESTADO_GESTION_REALIZADA_MESSAGES
              .EMPTY
          }
          itemLabel={
            PANEL_ESTADO_GESTION_REALIZADA_MESSAGES
              .ITEM_LABEL
          }
          verMasLabel={
            PANEL_ESTADO_GESTION_REALIZADA_MESSAGES
              .VER_MAS
          }
          fitToPanel
          setPageNumber={
            setPageNumber
          }
          setPageSize={
            setPageSize
          }
          onTextFilterChange={
            onTextFilterChange
          }
          onSelectedFilterChange={
            onSelectedFilterChange
          }
          onVerMas={
            handleVerMas
          }
        />
      ) : (
        <PanelTablaExpandida
          columns={columnsExpandidas}

          /*
           * Solamente los registros de
           * la página visible.
           */
          data={completo}

          /*
           * Colección histórica completa.
           * Se utiliza para crear las opciones
           * de los filtros.
           */
          allData={completoAllData}

          isLoading={
            completoLoading
          }
          error={
            completoError
          }

          pageNumber={
            completoPageNumber
          }
          pageSize={
            completoPageSize
          }
          totalRecords={
            completoTotalRecords
          }
          totalPages={
            completoTotalPages
          }

          textFilters={
            completoTextFilters
          }
          selectedFilters={
            completoSelectedFilters
          }

          emptyMessage={
            PANEL_ESTADO_GESTION_REALIZADA_MESSAGES
              .HISTORICAL_EMPTY
          }
          itemLabel={
            PANEL_ESTADO_GESTION_REALIZADA_MESSAGES
              .ITEM_LABEL
          }
          loadingMessage={
            PANEL_ESTADO_GESTION_REALIZADA_MESSAGES
              .HISTORICAL_LOADING
          }
          errorTitle={
            PANEL_ESTADO_GESTION_REALIZADA_MESSAGES
              .HISTORICAL_ERROR_TITLE
          }

          pageSizeOptions={
            PANEL_ESTADO_GESTION_REALIZADA_PAGE_SIZE_OPTIONS
          }
          showPageSizeSelector
          fitToPanel

          setPageNumber={
            setCompletoPageNumber
          }
          setPageSize={
            setCompletoPageSize
          }

          onTextFilterChange={
            onCompletoTextFilterChange
          }
          onSelectedFilterChange={
            onCompletoSelectedFilterChange
          }

          onRetry={
            refetchCompleto
          }
          onVolver={
            handleVolver
          }
        />
      )}
    </PanelLayout>
  );
};

export default PanelEstadoGestionRealizada;