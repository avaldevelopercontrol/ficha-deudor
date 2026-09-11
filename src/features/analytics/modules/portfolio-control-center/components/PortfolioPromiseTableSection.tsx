import type { Column } from '@shared/types';
import Table from '@shared/components/table/Table';
import { SisgesIcon } from '@shared/icons/sisges';

import type {
  PortfolioPagination,
  PortfolioSortDirection,
} from '../domain/portfolioPromises.types';
import { PortfolioPromiseDetailPagination } from './PortfolioPromiseDetailPagination';

interface PortfolioPromiseFilterOption<TFilter extends string> {
  value: TFilter;
  label: string;
}

interface PortfolioPromiseTableSectionProps<
  TItem,
  TFilter extends string,
> {
  sectionClassName: string;
  toolbarClassName: string;
  tableClassName: string;
  filterId: string;
  filterLabel: string;
  filterValue: TFilter;
  filterOptions: readonly PortfolioPromiseFilterOption<TFilter>[];
  onFilterChange: (value: TFilter) => void;
  isRefreshing?: boolean;
  refreshingMessage?: string;
  columns: Column<TItem>[];
  data: TItem[];
  emptyMessage: string;
  sortKey: string;
  sortDirection: PortfolioSortDirection;
  onSortChange: (key: string, direction: PortfolioSortDirection) => void;
  pagination: PortfolioPagination | null | undefined;
  requestedPage: number;
  requestedPageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function PortfolioPromiseTableSection<
  TItem,
  TFilter extends string,
>({
  sectionClassName,
  toolbarClassName,
  tableClassName,
  filterId,
  filterLabel,
  filterValue,
  filterOptions,
  onFilterChange,
  isRefreshing = false,
  refreshingMessage,
  columns,
  data,
  emptyMessage,
  sortKey,
  sortDirection,
  onSortChange,
  pagination,
  requestedPage,
  requestedPageSize,
  onPageChange,
  onPageSizeChange,
}: PortfolioPromiseTableSectionProps<TItem, TFilter>) {
  return (
    <section className={sectionClassName}>
      <div className={toolbarClassName}>
        <div className={`${toolbarClassName}__filter`}>
          <label
            className={`${toolbarClassName}__label`}
            htmlFor={filterId}
          >
            {filterLabel}
          </label>
          <select
            id={filterId}
            className={`${toolbarClassName}__select`}
            value={filterValue}
            onChange={(event) => {
              const selectedOption = filterOptions.find(
                (option) => option.value === event.target.value
              );

              if (selectedOption) {
                onFilterChange(selectedOption.value);
              }
            }}
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span
            className={`${toolbarClassName}__filter-icon`}
            aria-hidden="true"
          >
            <SisgesIcon name="filter" />
          </span>
        </div>
      </div>

      {isRefreshing && refreshingMessage && (
        <div
          className={`${tableClassName}__refreshing`}
          role="status"
        >
          {refreshingMessage}
        </div>
      )}

      <div className={tableClassName}>
        <Table
          columns={columns}
          data={data}
          emptyMessage={emptyMessage}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
          fitToPanel
        />
      </div>

      <PortfolioPromiseDetailPagination
        className={`${tableClassName}__pagination`}
        pagination={pagination}
        requestedPage={requestedPage}
        requestedPageSize={requestedPageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </section>
  );
}

export default PortfolioPromiseTableSection;
