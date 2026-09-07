import type React from 'react';
import { useMemo } from 'react';

import Modal from '@shared/components/modals/Modal';
import Table from '@shared/components/table/Table';
import TableResourceState from '@shared/components/table/TableResourceState';
import type { Column } from '@shared/types';
import { SisgesIcon } from '@shared/icons/sisges';

import type {
  PortfolioDueTodayPromiseItem,
  PortfolioDueTodayPromisesSortKey,
  PortfolioDueTodayStatusFilter,
  PortfolioOperationalContext,
  PortfolioSortDirection,
} from '../../../types/portfolioControlCenter.types';
import { PortfolioPromiseDetailPagination } from './PortfolioPromiseDetailPagination';
import { usePortfolioDueTodayPromises } from '../hooks/usePortfolioDueTodayPromises';
import { usePortfolioPromiseDetailTableState } from '../hooks/usePortfolioPromiseDetailTableState';
import {
  formatPortfolioCurrency,
  formatPortfolioInteger,
} from '../utils/portfolioControlCenter.formatters';
import {
  formatPortfolioPromiseCurrencyFilterOption,
  formatPortfolioPromiseDate,
} from '../utils/portfolioPromiseDetail.utils';

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
    <Modal
      isOpen={isOpen}
      title="Promesas con vencimiento hoy"
      onClose={handleClose}
      size="3xl"
    >
      <div className="portfolio-due-today-modal">
        <section className="portfolio-due-today-modal__intro">
          <span
            className="portfolio-due-today-modal__intro-icon"
            aria-hidden="true"
          >
            <SisgesIcon name="calendar" />
          </span>
          <div>
            <span className="portfolio-due-today-modal__eyebrow">
              Seguimiento del día
            </span>
            <h3>Compromisos que deben asegurarse durante el corte actual</h3>
            <p>
              Revisa cuánto ya fue cubierto, qué saldo sigue pendiente y qué
              compromisos requieren contacto antes de cerrar el día.
            </p>
          </div>
        </section>

        <TableResourceState
          isLoading={isLoading && data === null}
          error={error}
          onRetry={() => {
            void refetch();
          }}
          loadingMessage="Cargando promesas con vencimiento hoy..."
        >
          {data && (
            <>
              <div className="portfolio-due-today-summary">
                <article>
                  <span
                    className="portfolio-due-today-summary__icon"
                    aria-hidden="true"
                  >
                    <SisgesIcon name="calendar" />
                  </span>
                  <div>
                    <span>Promesas hoy</span>
                    <strong>
                      {formatPortfolioInteger(data.summary.dueTodayCount)}
                    </strong>
                  </div>
                </article>
                <article>
                  <span
                    className="portfolio-due-today-summary__icon"
                    aria-hidden="true"
                  >
                    <SisgesIcon name="money" />
                  </span>
                  <div>
                    <span>Monto comprometido</span>
                    <strong>
                      {formatPortfolioCurrency(data.summary.dueTodayAmount)}
                    </strong>
                  </div>
                </article>
                <article className="portfolio-due-today-summary__positive">
                  <span
                    className="portfolio-due-today-summary__icon"
                    aria-hidden="true"
                  >
                    <SisgesIcon name="payments" />
                  </span>
                  <div>
                    <span>Monto pagado</span>
                    <strong>
                      {formatPortfolioCurrency(data.summary.paidAmount)}
                    </strong>
                  </div>
                </article>
                <article className="portfolio-due-today-summary__critical">
                  <span
                    className="portfolio-due-today-summary__icon"
                    aria-hidden="true"
                  >
                    <SisgesIcon name="target" />
                  </span>
                  <div>
                    <span>Saldo pendiente</span>
                    <strong>
                      {formatPortfolioCurrency(
                        data.summary.outstandingAmount
                      )}
                    </strong>
                  </div>
                </article>
              </div>

              <section className="portfolio-due-today-status-panel">
                <div className="portfolio-due-today-status-panel__heading">
                  <div>
                    <span>Estado de cumplimiento</span>
                    <small>
                      Distribución de los compromisos que vencen en el corte
                      actual.
                    </small>
                  </div>
                  {data.asOfDate && (
                    <span className="portfolio-due-today-status-panel__cutoff">
                      Hoy {formatDate(data.asOfDate)}
                    </span>
                  )}
                </div>

                <div className="portfolio-due-today-status-panel__bars">
                  {statusBuckets.map((bucket) => (
                    <button
                      key={bucket.key}
                      type="button"
                      className={`portfolio-due-today-status-panel__row portfolio-due-today-status-panel__row--${bucket.key}${
                        status === bucket.key ? ' is-active' : ''
                      }`}
                      onClick={() => {
                        handleStatusChange(
                          status === bucket.key ? 'all' : bucket.key
                        );
                      }}
                      aria-pressed={status === bucket.key}
                    >
                      <span className="portfolio-due-today-status-panel__label">
                        {bucket.label}
                      </span>
                      <span className="portfolio-due-today-status-panel__track">
                        <span
                          className="portfolio-due-today-status-panel__fill"
                          style={{
                            width: `${(bucket.count / maxStatusCount) * 100}%`,
                          }}
                        />
                      </span>
                      <strong>
                        {formatPortfolioInteger(bucket.count)}
                      </strong>
                    </button>
                  ))}
                </div>
              </section>

              <section className="portfolio-due-today-table-section">
                <div className="portfolio-due-today-table-toolbar">
                  <div className="portfolio-due-today-table-toolbar__filter">
                    <label
                      className="portfolio-due-today-table-toolbar__label"
                      htmlFor="portfolio-due-today-status-filter"
                    >
                      Estado
                    </label>
                    <select
                      id="portfolio-due-today-status-filter"
                      className="portfolio-due-today-table-toolbar__select"
                      value={status}
                      onChange={(event) => {
                        handleStatusChange(
                          event.target.value as PortfolioDueTodayStatusFilter
                        );
                      }}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span
                      className="portfolio-due-today-table-toolbar__filter-icon"
                      aria-hidden="true"
                    >
                      <SisgesIcon name="filter" />
                    </span>
                  </div>
                </div>

                <div className="portfolio-due-today-table">
                  <Table
                    columns={columns}
                    data={[...normalizedItems]}
                    emptyMessage="No hay promesas con vencimiento hoy para los filtros seleccionados."
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                    fitToPanel
                  />
                </div>

                <PortfolioPromiseDetailPagination
                  className="portfolio-due-today-table__pagination"
                  pagination={data.pagination}
                  requestedPage={page}
                  requestedPageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={handlePageSizeChange}
                />
              </section>
            </>
          )}
        </TableResourceState>
      </div>
    </Modal>
  );
};

export default PortfolioDueTodayPromisesModal;
