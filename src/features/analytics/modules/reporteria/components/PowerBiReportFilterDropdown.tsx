import type React from 'react';
import type { ReactNode } from 'react';

import { InputField } from '@shared/components/ui';

import type { PowerBiReport } from '../domain/reporteria.types';
import {
  PowerBiReportCheckIcon,
  PowerBiReportSearchIcon,
} from './PowerBiReportFilterIcons';

interface FilterOptionProps {
  checked: boolean;
  children: ReactNode;
  onChange: () => void;
}

const FilterOption: React.FC<FilterOptionProps> = ({
  checked,
  children,
  onChange,
}) => (
  <label className="reporteria-search__option">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
    />
    <span
      className="reporteria-search__option-check"
      aria-hidden="true"
    >
      {checked && <PowerBiReportCheckIcon />}
    </span>
    <span className="reporteria-search__option-label">
      {children}
    </span>
  </label>
);

interface PowerBiReportFilterDropdownProps {
  listboxId: string;
  optionSearch: string;
  visibleOptions: readonly PowerBiReport[];
  selectedIds: ReadonlySet<number>;
  selectedReportCount: number;
  resultLabel: string;
  onSearchChange: (value: string) => void;
  onToggleReport: (reportId: number) => void;
  onShowAll: () => void;
}

export const PowerBiReportFilterDropdown: React.FC<
  PowerBiReportFilterDropdownProps
> = ({
  listboxId,
  optionSearch,
  visibleOptions,
  selectedIds,
  selectedReportCount,
  resultLabel,
  onSearchChange,
  onToggleReport,
  onShowAll,
}) => (
  <div
    id={listboxId}
    className="reporteria-search__dropdown"
    aria-labelledby={`${listboxId}-label`}
  >
    <div className="reporteria-search__dropdown-search">
      <span
        className="reporteria-search__input-icon"
        aria-hidden="true"
      >
        <PowerBiReportSearchIcon />
      </span>
      <InputField
        type="search"
        value={optionSearch}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Buscar por título..."
        autoComplete="off"
        wrapperClassName="reporteria-search__field"
        aria-label="Buscar entre los reportes"
      />
    </div>

    <div
      className="reporteria-search__options"
      role="group"
      aria-label="Reportes"
    >
      {!optionSearch.trim() && (
        <>
          <FilterOption
            checked={selectedReportCount === 0}
            onChange={onShowAll}
          >
            Todos los reportes
          </FilterOption>
          <div className="reporteria-search__divider" />
        </>
      )}

      {visibleOptions.length > 0 ? (
        visibleOptions.map((report) => (
          <FilterOption
            key={report.id}
            checked={selectedIds.has(report.id)}
            onChange={() => onToggleReport(report.id)}
          >
            {report.name}
          </FilterOption>
        ))
      ) : (
        <p className="reporteria-search__no-options">
          No hay reportes que coincidan con “{optionSearch.trim()}”.
        </p>
      )}
    </div>

    <div className="reporteria-search__dropdown-footer">
      <span>{resultLabel}</span>
      {selectedReportCount > 0 && (
        <button type="button" onClick={onShowAll}>
          Limpiar selección
        </button>
      )}
    </div>
  </div>
);

export default PowerBiReportFilterDropdown;
