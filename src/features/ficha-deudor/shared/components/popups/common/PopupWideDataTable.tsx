import Table from '@shared/components/table/Table';
import type { Column } from '@shared/types';
import type {
  SelectedFilters,
  TextFilters,
} from '@shared/hooks/useClientSideTable';
import { POPUP_WIDE_TABLE_WRAPPER_STYLE } from '../../../../shared/constants/popupCommon.constants';

interface PopupWideDataTableProps<T> {
  columns: Column[];
  data: T[];
  allData: T[];
  emptyMessage: string;
  totalWidth: number;
  enableColumnFilters?: boolean;
  textFilters?: TextFilters;
  selectedFilters?: SelectedFilters;
  onTextFilterChange?: (columnKey: string, value: string) => void;
  onSelectedFilterChange?: (columnKey: string, values: string[]) => void;
}

const EMPTY_TEXT_FILTERS: TextFilters = {};
const EMPTY_SELECTED_FILTERS: SelectedFilters = {};

const noopTextFilterChange = () => {};
const noopSelectedFilterChange = () => {};

export const PopupWideDataTable = <T,>({
  columns,
  data,
  allData,
  emptyMessage,
  totalWidth,
  enableColumnFilters = false,
  textFilters = EMPTY_TEXT_FILTERS,
  selectedFilters = EMPTY_SELECTED_FILTERS,
  onTextFilterChange = noopTextFilterChange,
  onSelectedFilterChange = noopSelectedFilterChange,
}: PopupWideDataTableProps<T>) => {
  return (
    <div className="popup-table-wrapper" style={POPUP_WIDE_TABLE_WRAPPER_STYLE}>
      <div style={{ minWidth: totalWidth }}>
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
    </div>
  );
};