import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import type {
  PortfolioSortDirection,
  SeguimientoPromesasCarteraPeriodo,
  SeguimientoPromesasCarteraSortKey,
  SeguimientoPromesasCarteraStatusFilter,
  SeguimientoPromesasCarteraStatusKey,
} from '../domain/promesasCartera.types';
import {
  getSeguimientoPromesasCarteraDate,
} from '../utils/detallePromesaCartera.utils';
import { useCentroControlCarteraPermissions } from './useCentroControlCarteraPermissions';
import { useDetallePromesaCarteraTableState } from './useDetallePromesaCarteraTableState';
import { useSeguimientoPromesasCartera } from './useSeguimientoPromesasCartera';
import {
  useSeguimientoPromesasCarteraExport,
} from './useSeguimientoPromesasCarteraExport';

interface UseSeguimientoPromesasCarteraModalControllerParams {
  isOpen: boolean;
  onClose: () => void;
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  > & { crmClientId: number };
  operationAsOfAt?: string | null;
}

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_STATUS: SeguimientoPromesasCarteraStatusFilter = 'all';
const DEFAULT_SORT_KEY: SeguimientoPromesasCarteraSortKey =
  'outstandingAmount';
const DEFAULT_SORT_DIRECTION: PortfolioSortDirection = 'desc';
const TRACKING_SORT_KEYS: readonly SeguimientoPromesasCarteraSortKey[] = [
  'debtorId',
  'promiseAmount',
  'paidAmount',
  'outstandingAmount',
  'statusLabel',
  'lastPaymentDate',
  'advisorName',
  'supervisorName',
];

const STATUS_ORDER: readonly SeguimientoPromesasCarteraStatusKey[] = [
  'pending',
  'partial',
  'fulfilled',
  'broken',
  'paid-out-of-range',
];

const STATUS_LABELS: Readonly<
  Record<SeguimientoPromesasCarteraStatusKey, string>
> = {
  pending: 'Pendiente',
  partial: 'Pago parcial',
  fulfilled: 'Cumplida',
  broken: 'Incumplida',
  'paid-out-of-range': 'Pagada fuera de plazo',
};

export const useSeguimientoPromesasCarteraModalController = ({
  isOpen,
  onClose,
  context,
  operationAsOfAt = null,
}: UseSeguimientoPromesasCarteraModalControllerParams) => {
  const [period, setPeriod] =
    useState<SeguimientoPromesasCarteraPeriodo>('today');

  const tableState = useDetallePromesaCarteraTableState<
    SeguimientoPromesasCarteraStatusFilter,
    SeguimientoPromesasCarteraSortKey
  >({
    defaultFilter: DEFAULT_STATUS,
    defaultSortKey: DEFAULT_SORT_KEY,
    sortKeys: TRACKING_SORT_KEYS,
    defaultSortDirection: DEFAULT_SORT_DIRECTION,
    defaultPageSize: DEFAULT_PAGE_SIZE,
  });

  const {
    filter: status,
    sortKey,
    sortDirection,
    page,
    pageSize,
    setPage,
    handleFilterChange: handleStatusChange,
    handleSortChange,
    handlePageSizeChange,
    reset: resetTableState,
  } = tableState;

  const dueDate = useMemo(
    () => getSeguimientoPromesasCarteraDate(period),
    [period]
  );

  const resource = useSeguimientoPromesasCartera({
    crmClientId: context.crmClientId,
    context,
    enabled: isOpen,
    dueDate,
    page,
    pageSize,
    status,
    sortKey,
    sortDirection,
  });

  const visibleData =
    resource.data?.dueDate === dueDate ? resource.data : null;
  const isToday = period === 'today';
  const { exportar: canExport } = useCentroControlCarteraPermissions();

  const exportState = useSeguimientoPromesasCarteraExport({
    crmClientId: context.crmClientId,
    context,
    period,
    dueDate,
    status,
    sortKey,
    sortDirection,
    operationAsOfAt,
  });

  const statusBuckets = useMemo(() => {
    const source = new Map(
      (visibleData?.status ?? []).map((item) => [item.key, item])
    );

    return STATUS_ORDER.flatMap((key) => {
      const bucket = source.get(key);

      return bucket
        ? [
            {
              key,
              label: bucket.label || STATUS_LABELS[key],
              count: bucket.count,
            },
          ]
        : [];
    });
  }, [visibleData?.status]);

  const statusOptions = useMemo<
    ReadonlyArray<{
      value: SeguimientoPromesasCarteraStatusFilter;
      label: string;
    }>
  >(
    () => [
      { value: 'all', label: 'Todos' },
      ...statusBuckets.map((bucket) => ({
        value: bucket.key,
        label: bucket.label,
      })),
    ],
    [statusBuckets]
  );

  const maxStatusCount = Math.max(
    1,
    ...statusBuckets.map((item) => item.count)
  );

  const handlePeriodChange = useCallback((
    nextPeriod: SeguimientoPromesasCarteraPeriodo
  ) => {
    if (nextPeriod === period) {
      return;
    }

    resetTableState();
    setPeriod(nextPeriod);
  }, [period, resetTableState]);

  const handleClose = useCallback(() => {
    resetTableState();
    setPeriod('today');
    onClose();
  }, [onClose, resetTableState]);

  return {
    period,
    dueDate,
    isToday,
    visibleData,
    isLoading: resource.isLoading,
    error: resource.error,
    refetch: resource.refetch,
    status,
    sortKey,
    sortDirection,
    page,
    pageSize,
    setPage,
    handleStatusChange,
    handleSortChange,
    handlePageSizeChange,
    handlePeriodChange,
    handleClose,
    statusBuckets,
    statusOptions,
    maxStatusCount,
    canExport,
    isExporting: exportState.isExporting,
    exportError: exportState.error,
    lastExportedCount: exportState.lastExportedCount,
    exportExcel: exportState.exportExcel,
  };
};
