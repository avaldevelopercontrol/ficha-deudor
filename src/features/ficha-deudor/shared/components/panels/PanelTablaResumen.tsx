import React from 'react';
import Table from '@shared/components/table/Table';
import { ActionButton } from '@shared/components/ui';
import Paginacion from '@shared/components/ui/Paginacion';
import type { Column } from '@shared/types';

const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 30, 50];

interface Props<TData> {
  columns: Column<TData>[];
  data: TData[];
  allData: TData[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  textFilters: Record<string, string>;
  selectedFilters: Record<string, string[]>;
  emptyMessage: string;
  itemLabel?: string;
  verMasLabel?: string;
  pageSizeOptions?: number[];
  showCount?: boolean;
  enableColumnFilters?: boolean;
  fitToPanel?: boolean;
  headerRight?: React.ReactNode;
  setPageNumber: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  onTextFilterChange: (key: string, value: string) => void;
  onSelectedFilterChange: (key: string, value: string[]) => void;
  onVerMas?: () => void;
  onRowClick?: (row: TData) => void;
}

interface PanelTablaResumenHeaderProps {
  showCount: boolean;
  itemLabel?: string;
  headerRight?: React.ReactNode;
  indiceInicio: number;
  indiceFin: number;
  totalRecords: number;
}

const PanelTablaResumenHeader: React.FC<PanelTablaResumenHeaderProps> = ({
  showCount,
  itemLabel,
  headerRight,
  indiceInicio,
  indiceFin,
  totalRecords,
}) => {
  const shouldShowHeader = (showCount && itemLabel) || headerRight;

  if (!shouldShowHeader) return null;

  return (
    <div
      style={{
        display: headerRight ? 'flex' : 'block',
        justifyContent: headerRight ? 'space-between' : undefined,
        alignItems: headerRight ? 'center' : undefined,
        marginBottom: '12px',
      }}
    >
      {showCount && itemLabel ? (
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
          Mostrando {indiceInicio + 1}-{indiceFin} de {totalRecords}{' '}
          {itemLabel}
        </span>
      ) : (
        <span />
      )}

      {headerRight}
    </div>
  );
};

interface PanelVerMasButtonProps {
  label?: string;
  onClick?: () => void;
}

const PanelVerMasButton: React.FC<PanelVerMasButtonProps> = ({
  label,
  onClick,
}) => {
  if (!onClick || !label) return null;

  return (
    <div style={{ textAlign: 'center', marginTop: '16px' }}>
      <ActionButton
        label={label}
        variant="info"
        size="md"
        icon="▼"
        onClick={onClick}
      />
    </div>
  );
};

const PanelTablaResumen = <TData,>({
  columns,
  data,
  allData,
  pageNumber,
  pageSize,
  totalRecords,
  totalPages,
  textFilters,
  selectedFilters,
  emptyMessage,
  itemLabel,
  verMasLabel,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showCount = true,
  enableColumnFilters = true,
  fitToPanel = false,
  headerRight,
  setPageNumber,
  setPageSize,
  onTextFilterChange,
  onSelectedFilterChange,
  onVerMas,
  onRowClick,
}: Props<TData>) => {
  const indiceInicio = (pageNumber - 1) * pageSize;
  const indiceFin = Math.min(pageNumber * pageSize, totalRecords);

  const handlePaginaAnterior = () => {
    setPageNumber(Math.max(1, pageNumber - 1));
  };

  const handlePaginaSiguiente = () => {
    setPageNumber(Math.min(totalPages, pageNumber + 1));
  };

  return (
    <div style={{ padding: '16px 0' }}>
      <PanelTablaResumenHeader
        showCount={showCount}
        itemLabel={itemLabel}
        headerRight={headerRight}
        indiceInicio={indiceInicio}
        indiceFin={indiceFin}
        totalRecords={totalRecords}
      />

      <Table
        columns={columns}
        data={data}
        onRowClick={onRowClick}
        emptyMessage={emptyMessage}
        enableColumnFilters={enableColumnFilters}
        allData={allData}
        textFilters={textFilters}
        selectedFilters={selectedFilters}
        onTextFilterChange={onTextFilterChange}
        onSelectedFilterChange={onSelectedFilterChange}
        fitToPanel={fitToPanel}
      />

      {totalPages > 0 && (
        <Paginacion
          paginaActual={pageNumber}
          totalPaginas={totalPages}
          totalRegistros={totalRecords}
          indiceInicio={indiceInicio}
          indiceFin={indiceFin}
          onPaginaAnterior={handlePaginaAnterior}
          onPaginaSiguiente={handlePaginaSiguiente}
          onIrAPagina={setPageNumber}
          showPageSizeSelector={true}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={setPageSize}
        />
      )}

      <PanelVerMasButton label={verMasLabel} onClick={onVerMas} />
    </div>
  );
};

export default PanelTablaResumen;