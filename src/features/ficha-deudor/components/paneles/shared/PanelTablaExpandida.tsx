import { useCallback, useMemo, useState } from 'react';
import Table from '../../../../../shared/components/table/Table';
import { ActionButton } from '../../../../../shared/components/ui';
import Paginacion from '../../../../../shared/components/ui/Paginacion';
import type { Column } from '../../../../../shared/types';

type TextFilters = Record<string, string>;
type SelectedFilters = Record<string, string[]>;

interface Props<TData> {
  columns: Column<TData>[];
  data: TData[];
  isLoading: boolean;
  error?: string | null;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
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
  onRetry: () => void;
  onVolver: () => void;
}

function getRowValue(row: unknown, key: string): unknown {
  if (typeof row !== 'object' || row === null) {
    return undefined;
  }

  return (row as Record<string, unknown>)[key];
}

const PanelTablaExpandida = <TData,>({
  columns,
  data,
  isLoading,
  error,
  pageNumber,
  pageSize,
  totalRecords,
  totalPages,
  emptyMessage,
  itemLabel,
  loadingMessage,
  errorTitle,
  pageSizeOptions = [5, 10, 30, 50],
  showPageSizeSelector = true,
  enableColumnFilters = true,
  fitToPanel = true,
  setPageNumber,
  setPageSize,
  onRetry,
  onVolver,
}: Props<TData>) => {
  const [textFilters, setTextFilters] = useState<TextFilters>({});
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({});

  const handleTextFilterChange = useCallback(
    (columnKey: string, value: string) => {
      setTextFilters((prev) => ({
        ...prev,
        [columnKey]: value,
      }));
    },
    []
  );

  const handleSelectedFilterChange = useCallback(
    (columnKey: string, values: string[]) => {
      setSelectedFilters((prev) => ({
        ...prev,
        [columnKey]: values,
      }));
    },
    []
  );

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const matchesTextFilters = Object.entries(textFilters).every(
        ([key, text]) => {
          if (!text) return true;

          const value = getRowValue(row, key);

          return (
            value !== undefined &&
            value !== null &&
            String(value).toLowerCase().includes(text.toLowerCase())
          );
        }
      );

      const matchesSelectedFilters = Object.entries(selectedFilters).every(
        ([key, values]) => {
          if (values.length === 0) return true;

          const value = getRowValue(row, key);

          return value !== undefined && value !== null
            ? values.includes(String(value))
            : false;
        }
      );

      return matchesTextFilters && matchesSelectedFilters;
    });
  }, [data, textFilters, selectedFilters]);

  const indiceInicio = totalRecords === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
  const indiceFin = Math.min(pageNumber * pageSize, totalRecords);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
        }}
      >
        <span style={{ fontSize: '12px', color: '#6b7a99' }}>
          Mostrando {indiceInicio}-{indiceFin} de {totalRecords} {itemLabel}
        </span>

        <ActionButton
          label="Volver"
          variant="secondary"
          size="sm"
          icon="←"
          onClick={onVolver}
        />
      </div>

      {isLoading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
          {loadingMessage}
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', color: '#c00' }}>
          <p style={{ marginBottom: 12 }}>{errorTitle}</p>

          <p style={{ fontSize: '0.9em', color: '#666', marginBottom: 16 }}>
            {error}
          </p>

          <button
            onClick={onRetry}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
            type="button"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <Table
            columns={columns}
            data={filteredData}
            allData={data}
            emptyMessage={emptyMessage}
            enableColumnFilters={enableColumnFilters}
            textFilters={textFilters}
            selectedFilters={selectedFilters}
            onTextFilterChange={handleTextFilterChange}
            onSelectedFilterChange={handleSelectedFilterChange}
            fitToPanel={fitToPanel}
          />

          {totalPages > 0 && (
            <Paginacion
              paginaActual={pageNumber}
              totalPaginas={totalPages}
              totalRegistros={totalRecords}
              indiceInicio={indiceInicio}
              indiceFin={indiceFin}
              onPaginaAnterior={() =>
                setPageNumber(Math.max(1, pageNumber - 1))
              }
              onPaginaSiguiente={() =>
                setPageNumber(Math.min(totalPages, pageNumber + 1))
              }
              onIrAPagina={setPageNumber}
              showPageSizeSelector={showPageSizeSelector}
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              onPageSizeChange={setPageSize}
            />
          )}
        </>
      )}
    </div>
  );
};

export default PanelTablaExpandida;