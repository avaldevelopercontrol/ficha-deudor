import { useCallback, useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { Column } from '../../types';
import ColumnFilter from '../ui/ColumnFilter';

interface Props<TData> {
  columns: Column<TData>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  rowClassName?: (row: TData) => string;
  emptyMessage?: string;
  enableColumnFilters?: boolean;
  allData?: TData[];
  textFilters?: Record<string, string>;
  selectedFilters?: Record<string, string[]>;
  onTextFilterChange?: (colKey: string, text: string) => void;
  onSelectedFilterChange?: (colKey: string, selected: string[]) => void;
  fitToPanel?: boolean;
}

interface HeaderCellGroup<TData> {
  key: string;
  label: string;
  colSpan: number;
  grouped: boolean;
  column?: Column<TData>;
}

function getRowValue(row: unknown, key: string): unknown {
  if (typeof row !== 'object' || row === null) {
    return undefined;
  }

  return (row as Record<string, unknown>)[key];
}

function getCellStyle<TData>(
  column: Column<TData> | undefined,
  fitToPanel: boolean
): CSSProperties | undefined {
  if (!column?.width) {
    return fitToPanel
      ? {
          maxWidth: 0,
          overflow: 'hidden',
        }
      : undefined;
  }

  if (fitToPanel) {
    return {
      width: column.width,
      maxWidth: column.width,
      overflow: 'hidden',
    };
  }

  return {
    width: column.width,
    minWidth: column.width,
  };
}

function Table<TData>({
  columns,
  data,
  onRowClick,
  rowClassName,
  emptyMessage = 'Sin registros',
  enableColumnFilters = false,
  allData = [],
  textFilters = {},
  selectedFilters = {},
  onTextFilterChange,
  onSelectedFilterChange,
  fitToPanel = true,
}: Props<TData>) {
  const hasGroupedHeaders = columns.some((col) => col.group && col.groupLabel);

  const applyFiltersExcludingColumn = useCallback(
    (colKeyToExclude: string, rows: TData[]) => {
      let filtered = [...rows];

      Object.entries(textFilters).forEach(([key, text]) => {
        if (key !== colKeyToExclude && text) {
          filtered = filtered.filter((item) => {
            const value = getRowValue(item, key);

            return (
              value !== undefined &&
              value !== null &&
              String(value).toLowerCase().includes(text.toLowerCase())
            );
          });
        }
      });

      Object.entries(selectedFilters).forEach(([key, selectedVals]) => {
        if (key !== colKeyToExclude && selectedVals.length) {
          filtered = filtered.filter((item) => {
            const value = getRowValue(item, key);

            return value !== undefined && value !== null
              ? selectedVals.includes(String(value))
              : false;
          });
        }
      });

      return filtered;
    },
    [textFilters, selectedFilters]
  );

  const uniqueValuesMap = useMemo(() => {
    const source = allData.length > 0 ? allData : [];
    const map: Record<string, string[]> = {};

    columns.forEach((col) => {
      const filteredData = applyFiltersExcludingColumn(col.key, source);
      const values = new Set<string>();

      filteredData.forEach((row) => {
        const value = getRowValue(row, col.key);

        if (value !== undefined && value !== null) {
          values.add(String(value));
        }
      });

      map[col.key] = Array.from(values).sort();
    });

    return map;
  }, [columns, allData, applyFiltersExcludingColumn]);

  const headerGroups = useMemo<HeaderCellGroup<TData>[]>(() => {
    const groups: HeaderCellGroup<TData>[] = [];
    let index = 0;

    while (index < columns.length) {
      const currentColumn = columns[index];

      if (currentColumn.group && currentColumn.groupLabel) {
        const groupKey = currentColumn.group;
        const groupLabel = currentColumn.groupLabel;
        let colSpan = 0;

        while (
          index + colSpan < columns.length &&
          columns[index + colSpan].group === groupKey
        ) {
          colSpan += 1;
        }

        groups.push({
          key: groupKey,
          label: groupLabel,
          colSpan,
          grouped: true,
        });

        index += colSpan;
      } else {
        groups.push({
          key: currentColumn.key,
          label: currentColumn.label,
          colSpan: 1,
          grouped: false,
          column: currentColumn,
        });

        index += 1;
      }
    }

    return groups;
  }, [columns]);

  return (
    <div
      className={`table-wrapper ${
        fitToPanel ? 'table-wrapper--fit' : 'table-wrapper--auto'
      }`}
      style={{
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        className="table-scroll"
        style={{
          width: '100%',
          maxWidth: '100%',
          overflowX: fitToPanel ? 'hidden' : 'auto',
        }}
      >
        <table
          className="data-table"
          style={{
            width: fitToPanel ? '100%' : undefined,
            maxWidth: fitToPanel ? '100%' : undefined,
            tableLayout: fitToPanel ? 'fixed' : 'auto',
          }}
        >
          <thead>
            {hasGroupedHeaders && (
              <tr className="data-table__group-row">
                {headerGroups.map((group) => (
                  <th
                    key={group.key}
                    colSpan={group.colSpan}
                    rowSpan={group.grouped ? 1 : 2}
                    style={getCellStyle(group.column, fitToPanel)}
                    className={
                      group.grouped
                        ? 'data-table__group-header'
                        : 'data-table__single-header'
                    }
                  >
                    <div
                      style={{
                        maxWidth: '100%',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                      }}
                    >
                      {group.label}
                    </div>
                  </th>
                ))}
              </tr>
            )}

            <tr
              className={
                hasGroupedHeaders
                  ? 'data-table__subheader-row'
                  : 'data-table__header-row'
              }
            >
              {columns.map((col) => {
                if (hasGroupedHeaders && !col.group) {
                  return null;
                }

                return (
                  <th key={col.key} style={getCellStyle(col, fitToPanel)}>
                    <div
                      style={{
                        maxWidth: '100%',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                      }}
                    >
                      {col.label}
                    </div>
                  </th>
                );
              })}
            </tr>

            {enableColumnFilters && (
              <tr className="data-table__filter-row">
                {columns.map((col) => (
                  <th
                    key={`${col.key}-filter`}
                    style={getCellStyle(col, fitToPanel)}
                  >
                    <div
                      style={{
                        maxWidth: '100%',
                        overflow: 'hidden',
                      }}
                    >
                      {col.filterable !== false ? (
                        <ColumnFilter
                          label={col.label}
                          values={uniqueValuesMap[col.key] || []}
                          selectedValues={selectedFilters[col.key] || []}
                          onSelectedChange={(selected) =>
                            onSelectedFilterChange?.(col.key, selected)
                          }
                          textFilter={textFilters[col.key] || ''}
                          onTextFilterChange={(text) =>
                            onTextFilterChange?.(col.key, text)
                          }
                        />
                      ) : (
                        <span className="data-table__filter-empty" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            )}
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-row">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  className={`${onRowClick ? 'clickable' : ''} ${
                    rowClassName ? rowClassName(row) : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} style={getCellStyle(col, fitToPanel)}>
                      <div
                        style={{
                          maxWidth: '100%',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word',
                          whiteSpace: 'normal',
                        }}
                      >
                        {col.render
                          ? col.render(row)
                          : String(getRowValue(row, col.key) ?? '—')}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;