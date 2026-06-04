// components/panels/TableSection.tsx
import React from 'react';
import Table from '../table/Table';
import Paginacion from '../ui/Paginacion';
import type { Column } from '../../types';

interface TableSectionProps<T> {
  columns: Column[];
  data: T[];
  allData: T[];
  emptyMessage: string;
  pageSize: number;
  pageSizeOptions?: number[];
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  indiceInicio: number;
  indiceFin: number;
  textFilters: Record<string, string>;
  selectedFilters: Record<string, string[]>;
  onTextFilterChange: (colKey: string, text: string) => void;
  onSelectedFilterChange: (colKey: string, selected: string[]) => void;
  onPaginaAnterior: () => void;
  onPaginaSiguiente: () => void;
  onIrAPagina: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  headerContent?: React.ReactNode;
  tableStyle?: React.CSSProperties;
}

export function TableSection<T>({
  columns,
  data,
  allData,
  emptyMessage,
  pageSize,
  pageSizeOptions = [5, 10, 30, 50],
  paginaActual,
  totalPaginas,
  totalRegistros,
  indiceInicio,
  indiceFin,
  textFilters,
  selectedFilters,
  onTextFilterChange,
  onSelectedFilterChange,
  onPaginaAnterior,
  onPaginaSiguiente,
  onIrAPagina,
  onPageSizeChange,
  headerContent,
  tableStyle,
}: TableSectionProps<T>) {
  return (
    <div style={{ padding: '16px 0', ...tableStyle }}>
      {headerContent && (
        <div style={{ marginBottom: '12px' }}>
          {headerContent}
        </div>
      )}

      <Table
        columns={columns}
        data={data}
        emptyMessage={emptyMessage}
        enableColumnFilters={true}
        allData={allData}
        textFilters={textFilters}
        selectedFilters={selectedFilters}
        onTextFilterChange={onTextFilterChange}
        onSelectedFilterChange={onSelectedFilterChange}
      />

      <Paginacion
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalRegistros={totalRegistros}
        indiceInicio={indiceInicio}
        indiceFin={indiceFin}
        onPaginaAnterior={onPaginaAnterior}
        onPaginaSiguiente={onPaginaSiguiente}
        onIrAPagina={onIrAPagina}
        showPageSizeSelector={true}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}