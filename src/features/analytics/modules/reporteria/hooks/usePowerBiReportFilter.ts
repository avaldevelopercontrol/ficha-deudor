import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { PowerBiReport } from '../domain/reporteria.types';

export const normalizePowerBiReportSearchValue = (
  value: string
): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es-PE');

export const filterPowerBiReports = (
  reports: readonly PowerBiReport[],
  search: string
): readonly PowerBiReport[] => {
  const normalizedSearch = normalizePowerBiReportSearchValue(search);

  if (!normalizedSearch) {
    return reports;
  }

  return reports.filter((report) =>
    normalizePowerBiReportSearchValue(report.name).includes(normalizedSearch)
  );
};

export const resolvePowerBiReportSelectionLabel = (
  reports: readonly PowerBiReport[],
  selectedReportIds: readonly number[]
): string => {
  if (selectedReportIds.length === 0) {
    return 'Todos los reportes';
  }

  if (selectedReportIds.length === 1) {
    const selectedReport = reports.find(
      (report) => report.id === selectedReportIds[0]
    );

    return selectedReport?.name ?? '1 reporte seleccionado';
  }

  return `${selectedReportIds.length} reportes seleccionados`;
};

export const resolvePowerBiReportResultLabel = (
  reportCount: number,
  selectedReportCount: number,
  filteredResults: number
): string =>
  selectedReportCount === 0
    ? `${reportCount} reportes`
    : `${filteredResults} de ${reportCount} reportes`;

export const togglePowerBiReportSelection = (
  selectedReportIds: readonly number[],
  reportId: number
): number[] =>
  selectedReportIds.includes(reportId)
    ? selectedReportIds.filter((id) => id !== reportId)
    : [...selectedReportIds, reportId];

interface UsePowerBiReportFilterParams {
  reports: readonly PowerBiReport[];
  selectedReportIds: number[];
  filteredResults: number;
  onChange: (reportIds: number[]) => void;
}

export function usePowerBiReportFilter({
  reports,
  selectedReportIds,
  filteredResults,
  onChange,
}: UsePowerBiReportFilterParams) {
  const [isOpen, setIsOpen] = useState(false);
  const [optionSearch, setOptionSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedIds = useMemo(
    () => new Set(selectedReportIds),
    [selectedReportIds]
  );
  const visibleOptions = useMemo(
    () => filterPowerBiReports(reports, optionSearch),
    [optionSearch, reports]
  );
  const selectionLabel = useMemo(
    () => resolvePowerBiReportSelectionLabel(reports, selectedReportIds),
    [reports, selectedReportIds]
  );
  const resultLabel = resolvePowerBiReportResultLabel(
    reports.length,
    selectedReportIds.length,
    filteredResults
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const closeDropdown = () => {
      setIsOpen(false);
      setOptionSearch('');
    };

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
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

  const handleToggleReport = (reportId: number) => {
    onChange(togglePowerBiReportSelection(selectedReportIds, reportId));
  };

  const handleShowAll = () => {
    onChange([]);
  };

  return {
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
  };
}
