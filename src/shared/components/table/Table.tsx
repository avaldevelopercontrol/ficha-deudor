import React, { useMemo } from 'react';
import type { Column } from '../../types';
import ColumnFilter from '../ui/ColumnFilter';

interface Props {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  rowClassName?: (row: any) => string;
  emptyMessage?: string;
  enableColumnFilters?: boolean;
  allData?: any[];
  textFilters?: Record<string, string>;
  selectedFilters?: Record<string, string[]>;
  onTextFilterChange?: (colKey: string, text: string) => void;
  onSelectedFilterChange?: (colKey: string, selected: string[]) => void;
  fitToPanel?: boolean;
}

const Table: React.FC<Props> = ({
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
}) => {

  const applyFiltersExcludingColumn = (colKeyToExclude: string, rows: any[]) => {
    let filtered = [...rows];

    Object.entries(textFilters).forEach(([key, text]) => {
      if (key !== colKeyToExclude && text) {
        filtered = filtered.filter(item => {
          const value = item[key];
          return value != null && String(value).toLowerCase().includes(text.toLowerCase());
        });
      }
    });

    Object.entries(selectedFilters).forEach(([key, selectedVals]) => {
      if (key !== colKeyToExclude && selectedVals.length) {
        filtered = filtered.filter(item => {
          const value = item[key];
          return value != null && selectedVals.includes(String(value));
        });
      }
    });

    return filtered;
  };

  const uniqueValuesMap = useMemo(() => {
    const source = allData.length > 0 ? allData : [];
    const map: Record<string, string[]> = {};

    columns.forEach(col => {
      const filteredData = applyFiltersExcludingColumn(col.key, source);
      const values = new Set<string>();

      filteredData.forEach(row => {
        const value = row[col.key];
        if (value !== undefined && value !== null) {
          values.add(String(value));
        }
      });

      map[col.key] = Array.from(values).sort();
    });

    return map;
  }, [columns, allData, textFilters, selectedFilters]);

  return (
    <div
      className="table-scroll"
      style={{
        width: '100%',
        overflowX: fitToPanel ? 'hidden' : 'auto',
      }}
    >
      <table
        className="data-table"
        style={{
          width: '100%',
          tableLayout: fitToPanel ? 'fixed' : 'auto',
          borderCollapse: 'collapse'
        }}
      >
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  width: col.width || 'auto',
                  minWidth: 0 // 🔥 IMPORTANTE
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>

          {enableColumnFilters && (
            <tr className="filter-row">
              {columns.map((col) => (
                <th
                  key={`filter-${col.key}`}
                  style={{
                    width: col.width || 'auto',
                    minWidth: 0,
                    position: 'relative',
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
                    <div style={{}} />
                  )}
                  
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
            data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`${onRowClick ? 'clickable' : ''} ${
                  rowClassName ? rowClassName(row) : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{
                      overflow: fitToPanel ? 'hidden' : 'visible',
                      textOverflow: fitToPanel ? 'ellipsis' : 'clip',
                      whiteSpace: fitToPanel ? 'nowrap' : 'normal',
                    }}
                  >
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;