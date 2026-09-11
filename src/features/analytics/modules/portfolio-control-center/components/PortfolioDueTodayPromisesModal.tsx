import type React from 'react';
import { useMemo } from 'react';

import type { Column } from '@shared/types';

import type {
  PortfolioOperationalContext,
} from '../domain/portfolioOverview.types';
import type {
  PortfolioDueTodayPromiseItem,
  PortfolioDueTodayPromisesSortKey,
  PortfolioDueTodayStatusFilter,
  PortfolioSortDirection,
} from '../domain/portfolioPromises.types';
import { usePortfolioDueTodayPromises } from '../hooks/usePortfolioDueTodayPromises';
import { usePortfolioPromiseDetailTableState } from '../hooks/usePortfolioPromiseDetailTableState';
import {
  formatPortfolioCurrency,
  formatPortfolioInteger,
} from '../utils/portfolioControlCenter.formatters';
import {
  formatPortfolioPromiseCurrencyFilterOption,
  formatPortfolioPromiseCutoffLabel,
  formatPortfolioPromiseDate,
} from '../utils/portfolioPromiseDetail.utils';
import { PortfolioPromiseDetailModalFrame } from './PortfolioPromiseDetailModalFrame';
import { PortfolioPromiseDistribution } from './PortfolioPromiseDistribution';
import { PortfolioPromiseSummary } from './PortfolioPromiseSummary';
import { PortfolioPromiseTableSection } from './PortfolioPromiseTableSection';

interface PortfolioDueTodayPromisesModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  > & { crmClientId: number };
}

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_STATUS: PortfolioDueTodayStatusFilter = 'all';
const DEFAULT_SORT_KEY: PortfolioDueTodayPromisesSortKey =
  'outstandingAmount';
const DEFAULT_SORT_DIRECTION: PortfolioSortDirection = 'desc';
const DUE_TODAY_SORT_KEYS: readonly PortfolioDueTodayPromisesSortKey[] = [
  'debtorId',
  'promiseAmount',
  'paidAmount',
  'outstandingAmount',
  'statusLabel',
  'lastPaymentDate',
  'advisorName',
  'supervisorName',
];

const STATUS_OPTIONS: ReadonlyArray<{
  value: PortfolioDueTodayStatusFilter;
  label: string;
}> = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'partial', label: 'Pago parcial' },
  { value: 'covered', label: 'Cubierta' },
];

const formatDate = (value: string | null): string =>
  formatPortfolioPromiseDate(value, 'Sin pago');

const getStatusTone = (
  statusKey: Exclude<PortfolioDueTodayStatusFilter, 'all'>
): 'pending' | 'partial' | 'covered' => statusKey;

export const PortfolioDueTodayPromisesModal: React.FC<
  PortfolioDueTodayPromisesModalProps
> = ({ isOpen, onClose, context }) => {
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
  } = usePortfolioPromiseDetailTableState<
    PortfolioDueTodayStatusFilter,
    PortfolioDueTodayPromisesSortKey
  >({
    defaultFilter: DEFAULT_STATUS,
    defaultSortKey: DEFAULT_SORT_KEY,
    sortKeys: DUE_TODAY_SORT_KEYS,
    defaultSortDirection: DEFAULT_SORT_DIRECTION,
    defaultPageSize: DEFAULT_PAGE_SIZE,
  });

  const {
    data,
    isLoading,
    error,
    refetch,
  } = usePortfolioDueTodayPromises({
    crmClientId: context.crmClientId,
    context,
    enabled: isOpen,
    page,
    pageSize,
    status,
    sortKey,
    sortDirection,
  });

  const normalizedItems = useMemo(
    () =>
      (data?.items ?? []).map((item) => ({
        ...item,
        lastPaymentDate: item.lastPaymentDate ?? 'Sin pago',
        advisorName: item.advisorName ?? 'Sin atribución',
        supervisorName: item.supervisorName ?? 'Sin atribución',
      })),
    [data?.items]
  );

  const columns = useMemo<Column<PortfolioDueTodayPromiseItem>[]>(
    () => [
      {
        key: 'debtorId',
        label: 'ID deudor',
        width: '11%',
        sortable: true,
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
          <strong className="portfolio-due-today-outstanding">
            {formatPortfolioCurrency(item.outstandingAmount)}
          </strong>
        ),
      },
      {
        key: 'statusLabel',
        label: 'Estado',
        width: '12%',
        sortable: true,
        render: (item) => (
          <span
            className={`portfolio-due-today-status portfolio-due-today-status--${getStatusTone(
              item.statusKey
            )}`}
          >
            {item.statusLabel}
          </span>
        ),
      },
      {
        key: 'lastPaymentDate',
        label: 'Último pago',
        width: '12%',
        sortable: true,
        filterOptionLabel: formatDate,
        render: (item) => formatDate(item.lastPaymentDate),
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
        width: '14%',
        sortable: true,
        render: (item) => item.supervisorName ?? 'Sin atribución',
      },
    ],
    []
  );

  const statusBuckets = useMemo(() => {
    const source = new Map(
      (data?.status ?? []).map((item) => [item.key, item])
    );

    return [
      {
        key: 'pending' as const,
        label: 'Pendientes',
        count: source.get('pending')?.count ?? 0,
      },
      {
        key: 'partial' as const,
        label: 'Pago parcial',
        count: source.get('partial')?.count ?? 0,
      },
      {
        key: 'covered' as const,
        label: 'Cubiertas',
        count: source.get('covered')?.count ?? 0,
      },
    ];
  }, [data?.status]);

  const maxStatusCount = Math.max(
    1,
    ...statusBuckets.map((item) => item.count)
  );

  const handleClose = () => {
    resetTableState();
    onClose();
  };

  return (
    <PortfolioPromiseDetailModalFrame
      isOpen={isOpen}
      title="Promesas con vencimiento hoy"
      onClose={handleClose}
      rootClassName="portfolio-due-today-modal"
      introIcon="calendar"
      eyebrow="Seguimiento del día"
      heading="Compromisos que deben asegurarse durante el corte actual"
      description="Revisa cuánto ya fue cubierto, qué saldo sigue pendiente y qué compromisos requieren contacto antes de cerrar el día."
      isInitialLoading={isLoading && data === null}
      error={error}
      onRetry={() => {
        void refetch();
      }}
      loadingMessage="Cargando promesas con vencimiento hoy..."
    >
      {data && (
        <>
          <PortfolioPromiseSummary
            className="portfolio-due-today-summary"
            items={[
              {
                key: 'due-today-count',
                icon: 'calendar',
                label: 'Promesas hoy',
                value: formatPortfolioInteger(data.summary.dueTodayCount),
              },
              {
                key: 'due-today-amount',
                icon: 'money',
                label: 'Monto comprometido',
                value: formatPortfolioCurrency(data.summary.dueTodayAmount),
              },
              {
                key: 'paid-amount',
                icon: 'payments',
                label: 'Monto pagado',
                value: formatPortfolioCurrency(data.summary.paidAmount),
                className: 'portfolio-due-today-summary__positive',
              },
              {
                key: 'outstanding-amount',
                icon: 'target',
                label: 'Saldo pendiente',
                value: formatPortfolioCurrency(data.summary.outstandingAmount),
                className: 'portfolio-due-today-summary__critical',
              },
            ]}
          />

          <PortfolioPromiseDistribution
            className="portfolio-due-today-status-panel"
            title="Estado de cumplimiento"
            description="Distribución de los compromisos que vencen en el corte actual."
            cutoff={formatPortfolioPromiseCutoffLabel(data.asOfDate)}
            buckets={statusBuckets}
            activeKey={status}
            maxCount={maxStatusCount}
            onToggle={(bucketKey) => {
              handleStatusChange(status === bucketKey ? 'all' : bucketKey);
            }}
            getRowModifierClassName={(bucketKey) =>
              `portfolio-due-today-status-panel__row--${bucketKey}`
            }
          />

          <PortfolioPromiseTableSection
            sectionClassName="portfolio-due-today-table-section"
            toolbarClassName="portfolio-due-today-table-toolbar"
            tableClassName="portfolio-due-today-table"
            filterId="portfolio-due-today-status-filter"
            filterLabel="Estado"
            filterValue={status}
            filterOptions={STATUS_OPTIONS}
            onFilterChange={handleStatusChange}
            columns={columns}
            data={[...normalizedItems]}
            emptyMessage="No hay promesas con vencimiento hoy para los filtros seleccionados."
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

export default PortfolioDueTodayPromisesModal;
