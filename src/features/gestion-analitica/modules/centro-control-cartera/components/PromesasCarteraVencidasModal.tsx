import type React from 'react';
import { useMemo } from 'react';

import { SisgesIcon } from '@shared/icons/sisges';
import type { Column } from '@shared/types';

import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import type {
  PortfolioOverdueAgingFilter,
  PortfolioOverduePromiseItem,
  PromesasCarteraVencidasSortKey,
  PortfolioSortDirection,
} from '../domain/promesasCartera.types';
import { useCentroControlCarteraPermissions } from '../hooks/useCentroControlCarteraPermissions';
import { usePromesasCarteraVencidas } from '../hooks/usePromesasCarteraVencidas';
import { usePromesasCarteraVencidasExport } from '../hooks/usePromesasCarteraVencidasExport';
import { useDetallePromesaCarteraTableState } from '../hooks/useDetallePromesaCarteraTableState';
import {
  formatPortfolioCurrency,
  formatPortfolioInteger,
} from '../utils/centroControlCartera.formatters';
import {
  formatPortfolioPromiseCurrencyFilterOption,
  formatPortfolioPromiseDate,
} from '../utils/detallePromesaCartera.utils';
import { DetallePromesaCarteraModalFrame } from './DetallePromesaCarteraModalFrame';
import { PortfolioPromiseDistribution } from './PortfolioPromiseDistribution';
import { PortfolioPromiseSummary } from './PortfolioPromiseSummary';
import { PortfolioPromiseTableSection } from './PortfolioPromiseTableSection';

interface PromesasCarteraVencidasModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  > & { crmClientId: number };
}

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_AGING: PortfolioOverdueAgingFilter = 'all';
const DEFAULT_SORT_KEY: PromesasCarteraVencidasSortKey = 'overdueDays';
const DEFAULT_SORT_DIRECTION: PortfolioSortDirection = 'desc';
const OVERDUE_SORT_KEYS: readonly PromesasCarteraVencidasSortKey[] = [
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

export const PromesasCarteraVencidasModal: React.FC<
  PromesasCarteraVencidasModalProps
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
  } = useDetallePromesaCarteraTableState<
    PortfolioOverdueAgingFilter,
    PromesasCarteraVencidasSortKey
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
  } = usePromesasCarteraVencidas({
    crmClientId: context.crmClientId,
    context,
    enabled: isOpen,
    page,
    pageSize,
    aging,
    sortKey,
    sortDirection,
  });

  const { exportar: canExport } = useCentroControlCarteraPermissions();
  const {
    isExporting,
    error: exportError,
    lastExportedCount,
    exportExcel,
  } = usePromesasCarteraVencidasExport({
    crmClientId: context.crmClientId,
    context,
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
        key: 'debtorName',
        label: 'Deudor',
        width: '18%',
        render: (item) => item.debtorName?.trim() || 'Sin nombre registrado',
      },
      {
        key: 'dueDate',
        label: 'Vencimiento',
        width: '10%',
        sortable: true,
        filterOptionLabel: formatDate,
        render: (item) => formatDate(item.dueDate),
      },
      {
        key: 'overdueDays',
        label: 'Días vencidos',
        width: '9%',
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
        key: 'situationLabel',
        label: 'Situación',
        width: '12%',
        render: (item) => (
          <span
            className={`portfolio-overdue-situation portfolio-overdue-situation--${item.situationKey}`}
          >
            {item.situationLabel}
          </span>
        ),
      },
      {
        key: 'promiseAmount',
        label: 'Prometido',
        width: '9%',
        align: 'right',
        sortable: true,
        filterOptionLabel: formatPortfolioPromiseCurrencyFilterOption,
        render: (item) => formatPortfolioCurrency(item.promiseAmount),
      },
      {
        key: 'paidAmount',
        label: 'Pagado',
        width: '9%',
        align: 'right',
        sortable: true,
        filterOptionLabel: formatPortfolioPromiseCurrencyFilterOption,
        render: (item) => formatPortfolioCurrency(item.paidAmount),
      },
      {
        key: 'outstandingAmount',
        label: 'Pendiente',
        width: '10%',
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
        width: '12%',
        sortable: true,
        render: (item) => item.advisorName ?? 'Sin atribución',
      },
      {
        key: 'supervisorName',
        label: 'Supervisor',
        width: '11%',
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
    <DetallePromesaCarteraModalFrame
      isOpen={isOpen}
      title="Promesas vencidas con saldo"
      onClose={handleClose}
      rootClassName="portfolio-overdue-modal"
      introIcon="warning"
      eyebrow="Atención operativa"
      heading="Compromisos vencidos que aún mantienen saldo pendiente"
      description="Incluye promesas sin pago registrado y promesas con abonos parciales que todavía mantienen saldo pendiente. Los filtros de la tabla no alteran los KPIs globales del modal."
      isInitialLoading={isLoading && data === null}
      error={error}
      onRetry={() => {
        void refetch();
      }}
      loadingMessage="Cargando promesas vencidas con saldo..."
    >
      {data && (
        <>
          <PortfolioPromiseSummary
            className="portfolio-overdue-summary"
            items={[
              {
                key: 'overdue-count',
                icon: 'warning',
                label: 'Promesas con saldo vencido',
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
            description="Distribución sobre las promesas vencidas que aún mantienen saldo pendiente."
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
            toolbarLeadingContent={
              canExport ? (
                <button
                  type="button"
                  className="portfolio-overdue-export-button"
                  onClick={() => {
                    void exportExcel();
                  }}
                  disabled={
                    isExporting ||
                    isLoading ||
                    data.pagination.totalItems <= 0
                  }
                >
                  <SisgesIcon name="export" />
                  <span>
                    {isExporting ? 'Generando Excel...' : 'Exportar Excel'}
                  </span>
                </button>
              ) : null
            }
            toolbarStatus={
              exportError ? (
                <div
                  className="portfolio-overdue-export-status is-error"
                  role="alert"
                >
                  {exportError}
                </div>
              ) : lastExportedCount !== null ? (
                <div
                  className="portfolio-overdue-export-status is-success"
                  role="status"
                >
                  Excel generado con {formatPortfolioInteger(lastExportedCount)} registro(s).
                </div>
              ) : null
            }
            isRefreshing={isLoading}
            refreshingMessage="Actualizando datos desde Analytics..."
            columns={columns}
            data={[...normalizedItems]}
            emptyMessage="No hay promesas vencidas con saldo para los filtros seleccionados."
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
    </DetallePromesaCarteraModalFrame>
  );
};

export default PromesasCarteraVencidasModal;
