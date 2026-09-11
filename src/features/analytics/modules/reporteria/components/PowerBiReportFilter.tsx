import type { PowerBiReport } from '../domain/reporteria.types';
import { usePowerBiReportFilter } from '../hooks/usePowerBiReportFilter';
import { PowerBiReportFilterDropdown } from './PowerBiReportFilterDropdown';
import {
  PowerBiReportChevronIcon,
  PowerBiReportSearchIcon,
} from './PowerBiReportFilterIcons';

interface PowerBiReportFilterProps {
  reports: readonly PowerBiReport[];
  selectedReportIds: number[];
  filteredResults: number;
  onChange: (reportIds: number[]) => void;
}

export function PowerBiReportFilter({
  reports,
  selectedReportIds,
  filteredResults,
  onChange,
}: PowerBiReportFilterProps) {
  const {
    isOpen,
    optionSearch,
    containerRef,
    listboxId,
    selectedIds,
    visibleOptions,
    selectionLabel,
    resultLabel,
    toggleDropdown,
    setOptionSearch,
    handleToggleReport,
    handleShowAll,
  } = usePowerBiReportFilter({
    reports,
    selectedReportIds,
    filteredResults,
    onChange,
  });

  return (
    <div
      className="reporteria-search"
      ref={containerRef}
    >
      <span
        className="reporteria-search__label"
        id={`${listboxId}-label`}
      >
        Filtrar reportes
      </span>

      <button
        type="button"
        className={`reporteria-search__trigger${
          isOpen ? ' reporteria-search__trigger--open' : ''
        }`}
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={`${listboxId}-label ${listboxId}-value`}
      >
        <span
          className="reporteria-search__trigger-icon"
          aria-hidden="true"
        >
          <PowerBiReportSearchIcon />
        </span>
        <span
          id={`${listboxId}-value`}
          className="reporteria-search__trigger-value"
        >
          {selectionLabel}
        </span>
        {selectedReportIds.length > 0 && (
          <span
            className="reporteria-search__selection-count"
            aria-hidden="true"
          >
            {selectedReportIds.length}
          </span>
        )}
        <span
          className="reporteria-search__chevron"
          aria-hidden="true"
        >
          <PowerBiReportChevronIcon />
        </span>
      </button>

      {isOpen && (
        <PowerBiReportFilterDropdown
          listboxId={listboxId}
          optionSearch={optionSearch}
          visibleOptions={visibleOptions}
          selectedIds={selectedIds}
          selectedReportCount={selectedReportIds.length}
          resultLabel={resultLabel}
          onSearchChange={setOptionSearch}
          onToggleReport={handleToggleReport}
          onShowAll={handleShowAll}
        />
      )}

      <span
        className="reporteria-search__results"
        aria-live="polite"
      >
        {resultLabel}
      </span>
    </div>
  );
}

export default PowerBiReportFilter;
