import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import type {
  AuthorizedOption,
} from '@features/access-control';

import {
  InputField,
} from '@shared/components/ui';

interface PowerBiReportFilterProps {
  reports: readonly AuthorizedOption[];
  selectedReportIds: number[];
  filteredResults: number;
  onChange: (reportIds: number[]) => void;
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="11"
        cy="11"
        r="7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="m16.5 16.5 4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m7 9 5 5 5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m5 12 4 4L19 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const normalizeSearchValue = (
  value: string
): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es-PE');

interface FilterOptionProps {
  checked: boolean;
  children: ReactNode;
  onChange: () => void;
}

function FilterOption({
  checked,
  children,
  onChange,
}: FilterOptionProps) {
  return (
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
        {checked && <CheckIcon />}
      </span>
      <span className="reporteria-search__option-label">
        {children}
      </span>
    </label>
  );
}

export function PowerBiReportFilter({
  reports,
  selectedReportIds,
  filteredResults,
  onChange,
}: PowerBiReportFilterProps) {
  const [isOpen, setIsOpen] =
    useState(false);
  const [optionSearch, setOptionSearch] =
    useState('');
  const containerRef =
    useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedIds = useMemo(
    () => new Set(selectedReportIds),
    [selectedReportIds]
  );

  const visibleOptions = useMemo(() => {
    const normalizedSearch =
      normalizeSearchValue(optionSearch);

    if (!normalizedSearch) {
      return reports;
    }

    return reports.filter((report) =>
      normalizeSearchValue(
        report.name
      ).includes(normalizedSearch)
    );
  }, [optionSearch, reports]);

  const selectionLabel = useMemo(() => {
    if (selectedReportIds.length === 0) {
      return 'Todos los reportes';
    }

    if (selectedReportIds.length === 1) {
      const selectedReport = reports.find(
        (report) =>
          report.id ===
          selectedReportIds[0]
      );

      return (
        selectedReport?.name ??
        '1 reporte seleccionado'
      );
    }

    return `${selectedReportIds.length} reportes seleccionados`;
  }, [reports, selectedReportIds]);

  const resultLabel =
    selectedReportIds.length === 0
      ? `${reports.length} reportes`
      : `${filteredResults} de ${reports.length} reportes`;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (
      event: MouseEvent
    ) => {
      if (
        !containerRef.current?.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
        setOptionSearch('');
      }
    };

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setOptionSearch('');
      }
    };

    document.addEventListener(
      'mousedown',
      handlePointerDown
    );
    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handlePointerDown
      );
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((currentValue) => {
      const nextValue = !currentValue;

      if (!nextValue) {
        setOptionSearch('');
      }

      return nextValue;
    });
  };

  const handleToggleReport = (
    reportId: number
  ) => {
    if (selectedIds.has(reportId)) {
      onChange(
        selectedReportIds.filter(
          (id) => id !== reportId
        )
      );
      return;
    }

    onChange([
      ...selectedReportIds,
      reportId,
    ]);
  };

  const handleShowAll = () => {
    onChange([]);
  };

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
          isOpen
            ? ' reporteria-search__trigger--open'
            : ''
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
          <SearchIcon />
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
          <ChevronIcon />
        </span>
      </button>

      {isOpen && (
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
              <SearchIcon />
            </span>
            <InputField
              type="search"
              value={optionSearch}
              onChange={(event) =>
                setOptionSearch(
                  event.target.value
                )
              }
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
                  checked={
                    selectedReportIds.length ===
                    0
                  }
                  onChange={handleShowAll}
                >
                  Todos los reportes
                </FilterOption>
                <div className="reporteria-search__divider" />
              </>
            )}

            {visibleOptions.length > 0 ? (
              visibleOptions.map(
                (report) => (
                  <FilterOption
                    key={report.id}
                    checked={selectedIds.has(
                      report.id
                    )}
                    onChange={() =>
                      handleToggleReport(
                        report.id
                      )
                    }
                  >
                    {report.name}
                  </FilterOption>
                )
              )
            ) : (
              <p className="reporteria-search__no-options">
                No hay reportes que coincidan con “
                {optionSearch.trim()}”.
              </p>
            )}
          </div>

          <div className="reporteria-search__dropdown-footer">
            <span>{resultLabel}</span>
            {selectedReportIds.length > 0 && (
              <button
                type="button"
                onClick={handleShowAll}
              >
                Limpiar selección
              </button>
            )}
          </div>
        </div>
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
