import type React from 'react';
import { useMemo } from 'react';

import type { Column } from '@shared/types';

import type {
  PortfolioOperationalContext,
} from '../domain/portfolioOverview.types';
import type {
  PortfolioOverdueAgingFilter,
  PortfolioOverduePromiseItem,
  PortfolioOverduePromisesSortKey,
  PortfolioSortDirection,
} from '../domain/portfolioPromises.types';
import { usePortfolioOverduePromises } from '../hooks/usePortfolioOverduePromises';
import { usePortfolioPromiseDetailTableState } from '../hooks/usePortfolioPromiseDetailTableState';
import {
  formatPortfolioCurrency,
  formatPortfolioInteger,
} from '../utils/portfolioControlCenter.formatters';
import {
  formatPortfolioPromiseCurrencyFilterOption,
  formatPortfolioPromiseDate,
} from '../utils/portfolioPromiseDetail.utils';
import { PortfolioPromiseDetailModalFrame } from './PortfolioPromiseDetailModalFrame';
import { PortfolioPromiseDistribution } from './PortfolioPromiseDistribution';
import { PortfolioPromiseSummary } from './PortfolioPromiseSummary';
import { PortfolioPromiseTableSection } from './PortfolioPromiseTableSection';

interface PortfolioOverduePromisesModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  > & { crmClientId: number };
}

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_AGING: PortfolioOverdueAgingFilter = 'all';
const DEFAULT_SORT_KEY: PortfolioOverduePromisesSortKey = 'overdueDays';
const DEFAULT_SORT_DIRECTION: PortfolioSortDirection = 'desc';
const OVERDUE_SORT_KEYS: readonly PortfolioOverduePromisesSortKey[] = [
  'debtorId',
  'dueDate',
  'overdueDays',
  'promiseAmount',
  'paidAmount',
  'outstandingAmount',
  'advisorName',
  'supervisorName',
];

const AGING_OPTIONS: ReadonlyArray<{
  value: PortfolioOverdueAgingFilter;
  label: string;
}> = [
  { value: 'all', label: 'Todas' },
  { value: '1-3', label: '1 - 3 días' },
  { value: '4-7', label: '4 - 7 días' },
  { value: '8-plus', label: '8+ días' },
];

const formatDate = (value: string | null): string =>
  formatPortfolioPromiseDate(value, '—');

const formatDaysFilterOption = (value: string): string => {
  const days = Number(value);

  return Number.isFinite(days)
    ? `${formatPortfolioInteger(days)} d`
    : value;
};

const getAgingTone = (
  days: number | null
): 'low' | 'medium' | 'high' | 'unknown' => {
  if (days === null) {
    return 'unknown';
  }

  if (days <= 3) {
    return 'low';
  }

  if (days <= 7) {
    return 'medium';
  }

  return 'high';
};

export const PortfolioOverduePromisesModal: React.FC<
  PortfolioOverduePromisesModalProps
> = ({ isOpen, onClose, context }) => {
  const {
    filter: aging,
    sortKey,
    sortDirection,
    page,
    pageSize,
    setPage,
    handleFilterChange: handleAgingChange,
    handleSortChange,
    handlePageSizeChange,
    reset: resetTableState,
  } = usePortfolioPromiseDetailTableState<
    PortfolioOverdueAgingFilter,
    PortfolioOverduePromisesSortKey
  >({
    defaultFilter: DEFAULT_AGING,
    defaultSortKey: DEFAULT_SORT_KEY,
    sortKeys: OVERDUE_SORT_KEYS,
    defaultSortDirection: DEFAULT_SORT_DIRECTION,
    defaultPageSize: DEFAULT_PAGE_SIZE,
  });

  const {
    data,
    isLoading,
    error,
    refetch,
  } = usePortfolioOverduePromises({
    crmClientId: context.crmClientId,
    context,
    enabled: isOpen,
    page,
    pageSize,
    aging,
    sortKey,
    sortDirection,
  });

  const normalizedItems = useMemo(
    () =>
      (data?.items ?? []).map((item) => ({
        ...item,
        advisorName: item.advisorName ?? 'Sin atribución',
        supervisorName: item.supervisorName ?? 'Sin atribución',
      })),
    [data?.items]
  );

  const columns = useMemo<Column<PortfolioOverduePromiseItem>[]>(
    () => [
      {
        key: 'debtorId',
        label: 'ID deudor',
        width: '11%',
        sortable: true,
      },
      {
        key: 'dueDate',
        label: 'Vencimiento',
        width: '12%',
        sortable: true,
        filterOptionLabel: formatDate,
        render: (item) => formatDate(item.dueDate),
      },
      {
        key: 'overdueDays',
        label: 'Días vencidos',
        width: '10%',
        sortable: true,
        filterOptionLabel: formatDaysFilterOption,
        render: (item) => (
          <span
            className={`portfolio-overdue-days portfolio-overdue-days--${getAgingTone(
              item.overdueDays
            )}`}
          >
            {item.overdueDays === null
              ? 'Sin fecha'
              : `${formatPortfolioInteger(item.overdueDays)} d`}
          </span>
        ),
      },
      {
        key: 'promiseAmount',
        label: 'Prometido',
        width: '11%',
        align: 'right',
        sortable: true,
        filterOptionLabel: formatPortfolioPromiseCurrencyFilterOption,
        render: (item) => formatPortfolioCurrency(item.promiseAmount),
      },
      {
        key: 'paidAmount',
        label: 'Pagado',
        width: '10%',
        align: 'right',
        sortable: true,
        filterOptionLabel: formatPortfolioPromiseCurrencyFilterOption,
        render: (item) => formatPortfolioCurrency(item.paidAmount),
      },
      {
        key: 'outstandingAmount',
        label: 'Pendiente',
        width: '11%',
        align: 'right',
        sortable: true,
        filterOptionLabel: formatPortfolioPromiseCurrencyFilterOption,
        render: (item) => (
          <strong className="portfolio-overdue-outstanding">
            {formatPortfolioCurrency(item.outstandingAmount)}
          </strong>
        ),
      },
      {
        key: 'advisorName',
        label: 'Asesor',
        width: '19%',
        sortable: true,
        render: (item) => item.advisorName ?? 'Sin atribución',
      },
      {
        key: 'supervisorName',
        label: 'Supervisor',
        width: '16%',
        sortable: true,
        render: (item) => item.supervisorName ?? 'Sin atribución',
      },
    ],
    []
  );

  const agingBuckets = useMemo(() => {
    const source = new Map(
      (data?.aging ?? []).map((item) => [item.key, item])
    );

    const ordered: Array<{
      key: Exclude<PortfolioOverdueAgingFilter, 'all'>;
      label: string;
      count: number;
    }> = [
      {
        key: '1-3',
        label: '1 - 3 días',
        count: source.get('1-3')?.count ?? 0,
      },
      {
        key: '4-7',
        label: '4 - 7 días',
        count: source.get('4-7')?.count ?? 0,
      },
      {
        key: '8-plus',
        label: '8+ días',
        count: source.get('8-plus')?.count ?? 0,
      },
    ];

    const unclassified = source.get('unclassified');
    if (unclassified && unclassified.count > 0) {
      ordered.push({
        key: 'unclassified',
        label: 'Sin fecha',
        count: unclassified.count,
      });
    }

    return ordered;
  }, [data?.aging]);

  const maxAgingCount = Math.max(
    1,
    ...agingBuckets.map((item) => item.count)
  );

  const availableAgingOptions = useMemo(() => {
    const options = [...AGING_OPTIONS];

    if (agingBuckets.some((item) => item.key === 'unclassified')) {
      options.push({
        value: 'unclassified',
        label: 'Sin fecha',
      });
    }

    return options;
  }, [agingBuckets]);

  const handleClose = () => {
    resetTableState();
    onClose();
  };

  return (
    <PortfolioPromiseDetailModalFrame
      isOpen={isOpen}
      title="Promesas vencidas"
      onClose={handleClose}
      rootClassName="portfolio-overdue-modal"
      introIcon="warning"
      eyebrow="Atención operativa"
      heading="Compromisos vencidos que requieren priorización"
      description="El resumen muestra la exposición total. Los filtros de la tabla se combinan entre sí y no alteran los KPIs globales del modal."
      isInitialLoading={isLoading && data === null}
      error={error}
      onRetry={() => {
        void refetch();
      }}
      loadingMessage="Cargando promesas vencidas..."
    >
      {data && (
        <>
          <PortfolioPromiseSummary
            className="portfolio-overdue-summary"
            items={[
              {
                key: 'overdue-count',
                icon: 'warning',
                label: 'Promesas vencidas',
                value: formatPortfolioInteger(data.summary.overdueCount),
              },
              {
                key: 'overdue-amount',
                icon: 'money',
                label: 'Monto prometido vencido',
                value: formatPortfolioCurrency(data.summary.overdueAmount),
              },
              {
                key: 'outstanding-amount',
                icon: 'target',
                label: 'Saldo pendiente',
                value: formatPortfolioCurrency(data.summary.outstandingAmount),
                className: 'portfolio-overdue-summary__critical',
              },
            ]}
          />

          <PortfolioPromiseDistribution
            className="portfolio-overdue-aging"
            title="Antigüedad de vencimiento"
            description="Distribución sobre las promesas vencidas del contexto seleccionado."
            cutoff={
              data.asOfDate ? `Corte ${formatDate(data.asOfDate)}` : null
            }
            buckets={agingBuckets}
            activeKey={aging}
            maxCount={maxAgingCount}
            onToggle={(bucketKey) => {
              handleAgingChange(aging === bucketKey ? 'all' : bucketKey);
            }}
          />

          <PortfolioPromiseTableSection
            sectionClassName="portfolio-overdue-table-section"
            toolbarClassName="portfolio-overdue-table-toolbar"
            tableClassName="portfolio-overdue-table"
            filterId="portfolio-overdue-aging-filter"
            filterLabel="Antigüedad"
            filterValue={aging}
            filterOptions={availableAgingOptions}
            onFilterChange={handleAgingChange}
            isRefreshing={isLoading}
            refreshingMessage="Actualizando datos desde Analytics..."
            columns={columns}
            data={[...normalizedItems]}
            emptyMessage="No hay promesas vencidas para los filtros seleccionados."
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            pagination={data.pagination}
            requestedPage={page}
            requestedPageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </PortfolioPromiseDetailModalFrame>
  );
};

export default PortfolioOverduePromisesModal;
