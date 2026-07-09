import { type ReactNode } from 'react';

import type { Column } from '@shared/types';
import type {
  SelectedFilters,
  TextFilters,
} from '@shared/hooks/useClientSideTable';
import { getPopupPaginationRange } from '../../../utils/popupPagination.utils';
import { PopupDataTable } from './PopupDataTable';
import { PopupTablePagination } from './PopupTablePagination';
import { PopupTableToolbar } from './PopupTableToolbar';

interface PopupPaginatedTableSectionProps<T> {
  columns: Column[];
  data: T[];
  allData: T[];
  emptyMessage: string;
  textFilters: TextFilters;
  selectedFilters: SelectedFilters;
  onTextFilterChange: (columnKey: string, value: string) => void;
  onSelectedFilterChange: (columnKey: string, values: string[]) => void;
  totalRecords: number;
  pageNumber: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions: number[];
  countSuffix: string;
  onPageNumberChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  actions?: ReactNode;
}

export const PopupPaginatedTableSection = <T,>({
  columns,
  data,
  allData,
  emptyMessage,
  textFilters,
  selectedFilters,
  onTextFilterChange,
  onSelectedFilterChange,
  totalRecords,
  pageNumber,
  totalPages,
  pageSize,
  pageSizeOptions,
  countSuffix,
  onPageNumberChange,
  onPageSizeChange,
  actions,
}: PopupPaginatedTableSectionProps<T>) => {
  const { indiceInicio, indiceFin } = getPopupPaginationRange({
    pageNumber,
    pageSize,
    totalRecords,
  });

  return (
    <>
      <PopupTableToolbar
        indiceInicio={indiceInicio}
        indiceFin={indiceFin}
        totalRecords={totalRecords}
        pageNumber={pageNumber}
        totalPages={totalPages}
        countSuffix={countSuffix}
        actions={actions}
      />

      <PopupDataTable
        columns={columns}
        data={data}
        allData={allData}
        emptyMessage={emptyMessage}
        textFilters={textFilters}
        selectedFilters={selectedFilters}
        onTextFilterChange={onTextFilterChange}
        onSelectedFilterChange={onSelectedFilterChange}
      />

      <PopupTablePagination
        pageNumber={pageNumber}
        totalPages={totalPages}
        totalRecords={totalRecords}
        indiceInicio={indiceInicio}
        indiceFin={indiceFin}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageNumberChange={onPageNumberChange}
        onPageSizeChange={onPageSizeChange}
      />
    </>
  );
};