import React from 'react';

import Table from '@shared/components/table/Table';
import { ActionButton } from '@shared/components/ui';
import Paginacion from '@shared/components/ui/Paginacion';
import type { Column } from '@shared/types';

type TextFilters = Record<string, string>;
type SelectedFilters = Record<string, string[]>;

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 30, 50];

interface Props<TData> {
  columns: Column<TData>[];

  /**
   * Registros filtrados y paginados que se muestran
   * en la página actual.
   */
  data: TData[];

  /**
   * Todos los registros obtenidos de la API.
   * Se utilizan para generar correctamente las opciones
   * de los filtros.
   */
  allData: TData[];

  isLoading: boolean;
  error?: string | null;

  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;

  textFilters: TextFilters;
  selectedFilters: SelectedFilters;

  emptyMessage: string;
  itemLabel: string;
  loadingMessage: string;
  errorTitle: string;

  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  enableColumnFilters?: boolean;
  fitToPanel?: boolean;

  setPageNumber: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  onTextFilterChange: (
    columnKey: string,
    value: string
  ) => void;

  onSelectedFilterChange: (
    columnKey: string,
    values: string[]
  ) => void;

  onRetry: () => void;
  onVolver: () => void;
}

interface PanelTablaExpandidaHeaderProps {
  indiceInicio: number;
  indiceFin: number;
  totalRecords: number;
  itemLabel: string;
  onVolver: () => void;
}

const PanelTablaExpandidaHeader: React.FC<
  PanelTablaExpandidaHeaderProps
> = ({
  indiceInicio,
  indiceFin,
  totalRecords,
  itemLabel,
  onVolver,
}) => {
  const primerRegistro =
    totalRecords === 0 ? 0 : indiceInicio + 1;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          fontSize: '12px',
          color: '#6b7a99',
        }}
      >
        Mostrando {primerRegistro}-{indiceFin} de{' '}
        {totalRecords} {itemLabel}
      </span>

      <ActionButton
        label="Volver"
        variant="secondary"
        size="sm"
        icon="←"
        onClick={onVolver}
      />
    </div>
  );
};

interface PanelTablaExpandidaLoadingProps {
  message: string;
}

const PanelTablaExpandidaLoading: React.FC<
  PanelTablaExpandidaLoadingProps
> = ({ message }) => {
  return (
    <div
      style={{
        padding: '2rem',
        textAlign: 'center',
        color: '#666',
      }}
    >
      {message}
    </div>
  );
};

interface PanelTablaExpandidaErrorProps {
  title: string;
  error: string;
  onRetry: () => void;
}

const PanelTablaExpandidaError: React.FC<
  PanelTablaExpandidaErrorProps
> = ({
  title,
  error,
  onRetry,
}) => {
  return (
    <div
      style={{
        padding: '2rem',
        color: '#c00',
      }}
    >
      <p style={{ marginBottom: 12 }}>
        {title}
      </p>

      <p
        style={{
          fontSize: '0.9em',
          color: '#666',
          marginBottom: 16,
        }}
      >
        {error}
      </p>

      <button
        type="button"
        onClick={onRetry}
        style={{
          padding: '8px 16px',
          cursor: 'pointer',
        }}
      >
        Reintentar
      </button>
    </div>
  );
};

const PanelTablaExpandida = <TData,>({
  columns,
  data,
  allData,
  isLoading,
  error,
  pageNumber,
  pageSize,
  totalRecords,
  totalPages,
  textFilters,
  selectedFilters,
  emptyMessage,
  itemLabel,
  loadingMessage,
  errorTitle,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showPageSizeSelector = true,
  enableColumnFilters = true,
  fitToPanel = true,
  setPageNumber,
  setPageSize,
  onTextFilterChange,
  onSelectedFilterChange,
  onRetry,
  onVolver,
}: Props<TData>) => {
  /*
   * Paginacion trabaja con un índice inicial basado en cero.
   * Antes se enviaba un índice basado en uno y por eso podía
   * aparecer "Mostrando 2-10" en la parte inferior.
   */
  const indiceInicio =
    totalRecords === 0
      ? 0
      : (pageNumber - 1) * pageSize;

  const indiceFin = Math.min(
    indiceInicio + pageSize,
    totalRecords
  );

  const handlePaginaAnterior = () => {
    setPageNumber(
      Math.max(1, pageNumber - 1)
    );
  };

  const handlePaginaSiguiente = () => {
    setPageNumber(
      Math.min(totalPages, pageNumber + 1)
    );
  };

  return (
    <div>
      <PanelTablaExpandidaHeader
        indiceInicio={indiceInicio}
        indiceFin={indiceFin}
        totalRecords={totalRecords}
        itemLabel={itemLabel}
        onVolver={onVolver}
      />

      {isLoading ? (
        <PanelTablaExpandidaLoading
          message={loadingMessage}
        />
      ) : error ? (
        <PanelTablaExpandidaError
          title={errorTitle}
          error={error}
          onRetry={onRetry}
        />
      ) : (
        <>
          <Table
            columns={columns}
            data={data}
            allData={allData}
            emptyMessage={emptyMessage}
            enableColumnFilters={
              enableColumnFilters
            }
            textFilters={textFilters}
            selectedFilters={
              selectedFilters
            }
            onTextFilterChange={
              onTextFilterChange
            }
            onSelectedFilterChange={
              onSelectedFilterChange
            }
            fitToPanel={fitToPanel}
          />

          {totalRecords > 0 &&
            totalPages > 0 && (
              <Paginacion
                paginaActual={pageNumber}
                totalPaginas={totalPages}
                totalRegistros={totalRecords}
                indiceInicio={indiceInicio}
                indiceFin={indiceFin}
                onPaginaAnterior={
                  handlePaginaAnterior
                }
                onPaginaSiguiente={
                  handlePaginaSiguiente
                }
                onIrAPagina={setPageNumber}
                showPageSizeSelector={
                  showPageSizeSelector
                }
                pageSize={pageSize}
                pageSizeOptions={
                  pageSizeOptions
                }
                onPageSizeChange={
                  setPageSize
                }
              />
            )}
        </>
      )}
    </div>
  );
};

export default PanelTablaExpandida;