import type React from 'react';
import { useMemo, useState } from 'react';

import { SisgesIcon } from '@shared/icons/sisges';
import type { Column } from '@shared/types';

import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import type {
  SeguimientoPromesaCarteraItem,
  SeguimientoPromesasCarteraPeriodo,
  SeguimientoPromesasCarteraSortKey,
  SeguimientoPromesasCarteraStatusFilter,
  SeguimientoPromesasCarteraStatusKey,
  PortfolioSortDirection,
} from '../domain/promesasCartera.types';
import { useDetallePromesaCarteraTableState } from '../hooks/useDetallePromesaCarteraTableState';
import { useSeguimientoPromesasCartera } from '../hooks/useSeguimientoPromesasCartera';
import {
  formatPortfolioCurrency,
  formatPortfolioInteger,
} from '../utils/centroControlCartera.formatters';
import {
  formatPortfolioPromiseDate,
  formatSeguimientoPromesasPeriodLabel,
  getSeguimientoPromesaEmptyActivityLabel,
  getSeguimientoPromesaStatusLabel,
  getSeguimientoPromesasCarteraDate,
} from '../utils/detallePromesaCartera.utils';
import { DetallePromesaCarteraModalFrame } from './DetallePromesaCarteraModalFrame';
import { PortfolioPromiseDistribution } from './PortfolioPromiseDistribution';
import { PortfolioPromiseSummary } from './PortfolioPromiseSummary';
import { PortfolioPromiseTableSection } from './PortfolioPromiseTableSection';

interface SeguimientoPromesasCarteraModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  > & { crmClientId: number };
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

const formatDate = (value: string | null): string =>
  formatPortfolioPromiseDate(value, 'Sin pago');

const getConfirmationLabel = (
  value: boolean | null
): 'Confirmó pago' | 'No confirmó' | 'Sin confirmación' => {
  if (value === true) {
    return 'Confirmó pago';
  }

  if (value === false) {
    return 'No confirmó';
  }

  return 'Sin confirmación';
};

const getConfirmationTone = (
  value: boolean | null
): 'confirmed' | 'not-confirmed' | 'unknown' => {
  if (value === true) {
    return 'confirmed';
  }

  if (value === false) {
    return 'not-confirmed';
  }

  return 'unknown';
};

export const SeguimientoPromesasCarteraModal: React.FC<
  SeguimientoPromesasCarteraModalProps
> = ({ isOpen, onClose, context }) => {
  const [period, setPeriod] =
    useState<SeguimientoPromesasCarteraPeriodo>('today');

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
  } = useDetallePromesaCarteraTableState<
    SeguimientoPromesasCarteraStatusFilter,
    SeguimientoPromesasCarteraSortKey
  >({
    defaultFilter: DEFAULT_STATUS,
    defaultSortKey: DEFAULT_SORT_KEY,
    sortKeys: TRACKING_SORT_KEYS,
    defaultSortDirection: DEFAULT_SORT_DIRECTION,
    defaultPageSize: DEFAULT_PAGE_SIZE,
  });

  const dueDate = useMemo(
    () => getSeguimientoPromesasCarteraDate(period),
    [period]
  );

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useSeguimientoPromesasCartera({
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

  const visibleData = data?.dueDate === dueDate ? data : null;
  const isToday = period === 'today';

  const columns = useMemo<Column<SeguimientoPromesaCarteraItem>[]>(
    () => [
      {
        key: 'debtorId',
        label: 'Deudor',
        width: '20%',
        sortable: true,
        render: (item) => (
          <div className="portfolio-promise-tracking-debtor">
            <strong>
              {item.debtorName?.trim() || `Deudor ${item.debtorId}`}
            </strong>
            <span>ID {item.debtorId}</span>
          </div>
        ),
      },
      {
        key: 'managementCount',
        label: isToday ? 'Actividad de hoy' : 'Actividad de ayer',
        width: '28%',
        render: (item) => {
          if (!item.managed) {
            const isResolved = item.outstandingAmount <= 0;

            return (
              <div className="portfolio-promise-tracking-activity">
                <span
                  className={`portfolio-promise-tracking-empty-activity ${
                    isResolved ? 'is-resolved' : 'is-action-required'
                  }`}
                >
                  {getSeguimientoPromesaEmptyActivityLabel(
                    item.outstandingAmount,
                    period
                  )}
                </span>
                {isResolved && (
                  <small className="portfolio-promise-tracking-activity__hint">
                    La promesa ya estaba cubierta para el vencimiento.
                  </small>
                )}
              </div>
            );
          }

          return (
            <div className="portfolio-promise-tracking-activity">
              <div className="portfolio-promise-tracking-activity__counts">
                <span className="portfolio-promise-tracking-metric is-active">
                  <SisgesIcon name="history" />
                  <strong>{formatPortfolioInteger(item.managementCount)}</strong>
                  <span>gestiones</span>
                </span>
                <span className="portfolio-promise-tracking-metric">
                  <SisgesIcon name="phone" />
                  <strong>{formatPortfolioInteger(item.callCount)}</strong>
                  <span>llamadas</span>
                </span>
              </div>
              <div className="portfolio-promise-tracking-activity__signals">
                <span
                  className={`portfolio-promise-tracking-contact portfolio-promise-tracking-contact--${item.contactKey}`}
                >
                  {item.contactLabel}
                </span>
                {item.paymentConfirmed !== null && (
                  <span
                    className={`portfolio-promise-tracking-confirmation portfolio-promise-tracking-confirmation--${getConfirmationTone(
                      item.paymentConfirmed
                    )}`}
                  >
                    {getConfirmationLabel(item.paymentConfirmed)}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: 'promiseAmount',
        label: 'Compromiso',
        width: '15%',
        align: 'right',
        sortable: true,
        render: (item) => (
          <div className="portfolio-promise-tracking-amount">
            <strong>{formatPortfolioCurrency(item.promiseAmount)}</strong>
            <span>Pagado {formatPortfolioCurrency(item.paidAmount)}</span>
            <small>Últ. pago: {formatDate(item.lastPaymentDate)}</small>
          </div>
        ),
      },
      {
        key: 'outstandingAmount',
        label: 'Pendiente',
        width: '11%',
        align: 'right',
        sortable: true,
        render: (item) => (
          <strong
            className={
              item.outstandingAmount > 0
                ? 'portfolio-promise-tracking-outstanding'
                : 'portfolio-promise-tracking-outstanding is-covered'
            }
          >
            {formatPortfolioCurrency(item.outstandingAmount)}
          </strong>
        ),
      },
      {
        key: 'statusLabel',
        label: 'Estado',
        width: '11%',
        sortable: true,
        render: (item) => (
          <span
            className={`portfolio-promise-tracking-status portfolio-promise-tracking-status--${item.statusKey}`}
          >
            {getSeguimientoPromesaStatusLabel(
              item.statusKey,
              item.statusLabel,
              item.lastPaymentDate,
              item.dueDate ?? dueDate
            )}
          </span>
        ),
      },
      {
        key: 'advisorName',
        label: 'Responsable',
        width: '15%',
        sortable: true,
        render: (item) => (
          <div className="portfolio-promise-tracking-owner">
            <strong>{item.advisorName ?? 'Sin asesor'}</strong>
            <span>{item.supervisorName ?? 'Sin supervisor'}</span>
          </div>
        ),
      },
    ],
    [dueDate, isToday, period]
  );

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

  const handlePeriodChange = (
    nextPeriod: SeguimientoPromesasCarteraPeriodo
  ) => {
    if (nextPeriod === period) {
      return;
    }

    resetTableState();
    setPeriod(nextPeriod);
  };

  const handleClose = () => {
    resetTableState();
    setPeriod('today');
    onClose();
  };

  return (
    <DetallePromesaCarteraModalFrame
      isOpen={isOpen}
      title="Seguimiento de promesas"
      onClose={handleClose}
      rootClassName="portfolio-promise-tracking-modal"
      introIcon="target"
      eyebrow={isToday ? 'Control operativo del día' : 'Revisión del cierre anterior'}
      heading={
        isToday
          ? 'Qué promesas requieren acción antes de cerrar el día'
          : 'Cómo terminaron las promesas que vencieron ayer'
      }
      description={
        isToday
          ? 'Prioriza deudores sin gestión, revisa el nivel de contacto y confirma si el compromiso ya tiene evidencia de pago.'
          : 'Contrasta gestión, contacto y resultado de pago para detectar compromisos incumplidos o cubiertos fuera de plazo.'
      }
      isInitialLoading={isLoading && visibleData === null}
      error={error}
      onRetry={() => {
        void refetch();
      }}
      loadingMessage="Cargando seguimiento de promesas..."
    >
      <div
        className="portfolio-promise-tracking-period"
        role="group"
        aria-label="Período de seguimiento"
      >
        {(['today', 'yesterday'] as const).map((option) => {
          const optionDate = getSeguimientoPromesasCarteraDate(option);
          const isActive = period === option;

          return (
            <button
              key={option}
              type="button"
              className={isActive ? 'is-active' : undefined}
              onClick={() => handlePeriodChange(option)}
              aria-pressed={isActive}
            >
              <span>{option === 'today' ? 'Vencen hoy' : 'Vencieron ayer'}</span>
              <small>
                {formatSeguimientoPromesasPeriodLabel(option, optionDate)}
              </small>
            </button>
          );
        })}
      </div>

      {visibleData && (
        <>
          <PortfolioPromiseSummary
            className="portfolio-promise-tracking-summary"
            items={[
              {
                key: 'promise-count',
                icon: 'calendar',
                label: isToday ? 'Promesas de hoy' : 'Promesas de ayer',
                value: formatPortfolioInteger(
                  visibleData.summary.promiseCount
                ),
              },
              {
                key: 'promise-amount',
                icon: 'money',
                label: 'Monto comprometido',
                value: formatPortfolioCurrency(
                  visibleData.summary.promiseAmount
                ),
              },
              {
                key: 'paid-amount',
                icon: 'payments',
                label: 'Monto pagado',
                value: formatPortfolioCurrency(
                  visibleData.summary.paidAmount
                ),
                className: 'portfolio-promise-tracking-summary__positive',
              },
              {
                key: 'outstanding-amount',
                icon: 'target',
                label: 'Saldo pendiente',
                value: formatPortfolioCurrency(
                  visibleData.summary.outstandingAmount
                ),
                className: 'portfolio-promise-tracking-summary__critical',
              },
            ]}
          />

          {statusBuckets.length > 0 && (
            <PortfolioPromiseDistribution
              className="portfolio-promise-tracking-status-panel"
              title={isToday ? 'Situación de las promesas' : 'Resultado de ayer'}
              description={
                isToday
                  ? 'Selecciona un estado para concentrar el seguimiento operativo.'
                  : 'Selecciona un resultado para revisar cómo fue gestionado.'
              }
              cutoff={formatSeguimientoPromesasPeriodLabel(period, dueDate)}
              buckets={statusBuckets}
              activeKey={status}
              maxCount={maxStatusCount}
              onToggle={(bucketKey) => {
                handleStatusChange(status === bucketKey ? 'all' : bucketKey);
              }}
              getRowModifierClassName={(bucketKey) =>
                `portfolio-promise-tracking-status-panel__row--${bucketKey}`
              }
            />
          )}

          <PortfolioPromiseTableSection
            sectionClassName="portfolio-promise-tracking-table-section"
            toolbarClassName="portfolio-promise-tracking-table-toolbar"
            tableClassName="portfolio-promise-tracking-table"
            filterId="portfolio-promise-tracking-status-filter"
            filterLabel="Estado"
            filterValue={status}
            filterOptions={statusOptions}
            onFilterChange={handleStatusChange}
            isRefreshing={isLoading}
            refreshingMessage="Actualizando seguimiento..."
            columns={columns}
            data={[...visibleData.items]}
            emptyMessage={
              isToday
                ? 'No hay promesas con vencimiento hoy para los filtros seleccionados.'
                : 'No hay promesas con vencimiento ayer para los filtros seleccionados.'
            }
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            pagination={visibleData.pagination}
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

export default SeguimientoPromesasCarteraModal;
