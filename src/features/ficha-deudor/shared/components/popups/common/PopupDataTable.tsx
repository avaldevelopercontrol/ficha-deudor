import Table from '@shared/components/table/Table';
import type { Column } from '@shared/types';
import type {
  SelectedFilters,
  TextFilters,
} from '@shared/hooks/useClientSideTable';

interface PopupDataTableProps<T> {
  columns: Column[];
  data: T[];
  allData: T[];
  emptyMessage: string;
  textFilters: TextFilters;
  selectedFilters: SelectedFilters;
  onTextFilterChange: (columnKey: string, value: string) => void;
  onSelectedFilterChange: (columnKey: string, values: string[]) => void;
  enableColumnFilters?: boolean;
}

export const PopupDataTable = <T,>({
  columns,
  data,
  allData,
  emptyMessage,
  textFilters,
  selectedFilters,
  onTextFilterChange,
  onSelectedFilterChange,
  enableColumnFilters = true,
}: PopupDataTableProps<T>) => {
  return (
    <div className="popup-table-wrapper">
      <Table
        columns={columns}
        data={data}
        emptyMessage={emptyMessage}
        enableColumnFilters={enableColumnFilters}
        allData={allData}
        textFilters={textFilters}
        selectedFilters={selectedFilters}
        onTextFilterChange={onTextFilterChange}
        onSelectedFilterChange={onSelectedFilterChange}
      />
    </div>
  );
};