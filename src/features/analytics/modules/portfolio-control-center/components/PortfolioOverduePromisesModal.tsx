import type React from 'react';
import {
  useMemo,
  useState,
} from 'react';

import Modal from '@shared/components/modals/Modal';
import Table from '@shared/components/table/Table';
import TableResourceState from '@shared/components/table/TableResourceState';
import { useClientSideTable } from '@shared/hooks/useClientSideTable';
import Paginacion from '@shared/components/ui/Paginacion';
import type { Column } from '@shared/types';
import { SisgesIcon } from '@shared/icons/sisges';

import type {
  PortfolioOperationalContext,
  PortfolioOverdueAgingFilter,
  PortfolioOverduePromiseItem,
  PortfolioOverduePromisesSortKey,
  PortfolioSortDirection,
} from '../../../types/portfolioControlCenter.types';
import {
  usePortfolioOverduePromises,
} from '../hooks/usePortfolioOverduePromises';
import {
  formatPortfolioCurrency,
  formatPortfolioInteger,
} from '../utils/portfolioControlCenter.formatters';
import {
  filterPortfolioOverduePromisesByAging,
  sortPortfolioOverduePromises,
} from '../utils/portfolioOverduePromises.utils';

interface PortfolioOverduePromisesModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: Pick<
    PortfolioOperationalContext,
    'campaignId' | 'subPortfolioId'
  >;
}

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_AGING: PortfolioOverdueAgingFilter = 'all';
const DEFAULT_SORT_KEY: PortfolioOverduePromisesSortKey = 'overdueDays';
const DEFAULT_SORT_DIRECTION: PortfolioSortDirection = 'desc';

const AGING_OPTIONS: ReadonlyArray<{
  value: PortfolioOverdueAgingFilter;
  label: string;
}> = [
  { value: 'all', label: 'Todas' },
  { value: '1-3', label: '1 - 3 días' },
  { value: '4-7', label: '4 - 7 días' },
  { value: '8-plus', label: '8+ días' },
];

const formatDate = (value: string | null): string => {
  if (!value) {
    return '—';
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return value;
  }

  return `${match[3]}/${match[2]}/${match[1]}`;
};

const formatCurrencyFilterOption = (value: string): string => {
  const amount = Number(value);

  return Number.isFinite(amount)
    ? formatPortfolioCurrency(amount)
    : value;
};

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
  const [aging, setAging] =
    useState<PortfolioOverdueAgingFilter>(DEFAULT_AGING);
  const [sortKey, setSortKey] =
    useState<PortfolioOverduePromisesSortKey>(DEFAULT_SORT_KEY);
  const [sortDirection, setSortDirection] =
    useState<PortfolioSortDirection>(DEFAULT_SORT_DIRECTION);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = usePortfolioOverduePromises({
    context,
    enabled: isOpen,
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

  const agingScopedItems = useMemo(
    () =>
      filterPortfolioOverduePromisesByAging(
        normalizedItems,
        aging
      ),
    [aging, normalizedItems]
  );

  const sortedItems = useMemo(
    () =>
      sortPortfolioOverduePromises(
        agingScopedItems,
        sortKey,
        sortDirection
      ),
    [agingScopedItems, sortDirection, sortKey]
  );

  const table = useClientSideTable(
    sortedItems,
    [context.campaignId, context.subPortfolioId],
    { initialPageSize: DEFAULT_PAGE_SIZE }
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
        filterOptionLabel: formatCurrencyFilterOption,
        render: (item) => formatPortfolioCurrency(item.promiseAmount),
      },
      {
        key: 'paidAmount',
        label: 'Pagado',
        width: '10%',
        align: 'right',
        sortable: true,
        filterOptionLabel: formatCurrencyFilterOption,
        render: (item) => formatPortfolioCurrency(item.paidAmount),
      },
      {
        key: 'outstandingAmount',
        label: 'Pendiente',
        width: '11%',
        align: 'right',
        sortable: true,
        filterOptionLabel: formatCurrencyFilterOption,
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

  const handleAgingChange = (
    nextAging: PortfolioOverdueAgingFilter
  ) => {
    setAging(nextAging);
    table.setPageNumber(1);
  };

  const handleSortChange = (
    key: string,
    direction: PortfolioSortDirection
  ) => {
    setSortKey(key as PortfolioOverduePromisesSortKey);
    setSortDirection(direction);
    table.setPageNumber(1);
  };

  const handleClearLocalFilters = () => {
    table.resetFilters();
    setAging(DEFAULT_AGING);
    setSortKey(DEFAULT_SORT_KEY);
    setSortDirection(DEFAULT_SORT_DIRECTION);
  };

  const handleClose = () => {
    handleClearLocalFilters();
    onClose();
  };

  const indiceInicio =
    (table.pageNumber - 1) * table.pageSize;
  const indiceFin = Math.min(
    indiceInicio + table.pageSize,
    table.totalRecords
  );

  return (
    <Modal
      isOpen={isOpen}
      title="Promesas vencidas"
      onClose={handleClose}
      size="3xl"
    >
      <div className="portfolio-overdue-modal">
        <section className="portfolio-overdue-modal__intro">
          <span className="portfolio-overdue-modal__intro-icon" aria-hidden="true">
            <SisgesIcon name="warning" />
          </span>
          <div>
            <span className="portfolio-overdue-modal__eyebrow">
              Atención operativa
            </span>
            <h3>Compromisos vencidos que requieren priorización</h3>
            <p>
              El resumen muestra la exposición total. Los filtros de la tabla
              se combinan entre sí y no alteran los KPIs globales del modal.
            </p>
          </div>
        </section>

        <TableResourceState
          isLoading={isLoading && data === null}
          error={error}
          onRetry={() => {
            void refetch();
          }}
          loadingMessage="Cargando promesas vencidas..."
        >
          {data && (
            <>
              <div className="portfolio-overdue-summary">
                <article>
                  <span className="portfolio-overdue-summary__icon" aria-hidden="true">
                    <SisgesIcon name="warning" />
                  </span>
                  <div>
                    <span>Promesas vencidas</span>
                    <strong>
                      {formatPortfolioInteger(data.summary.overdueCount)}
                    </strong>
                  </div>
                </article>
                <article>
                  <span className="portfolio-overdue-summary__icon" aria-hidden="true">
                    <SisgesIcon name="money" />
                  </span>
                  <div>
                    <span>Monto prometido vencido</span>
                    <strong>
                      {formatPortfolioCurrency(data.summary.overdueAmount)}
                    </strong>
                  </div>
                </article>
                <article className="portfolio-overdue-summary__critical">
                  <span className="portfolio-overdue-summary__icon" aria-hidden="true">
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

              <section className="portfolio-overdue-aging">
                <div className="portfolio-overdue-aging__heading">
                  <div>
                    <span>Antigüedad de vencimiento</span>
                    <small>
                      Distribución sobre las promesas vencidas del contexto
                      seleccionado.
                    </small>
                  </div>
                  {data.asOfDate && (
                    <span className="portfolio-overdue-aging__cutoff">
                      Corte {formatDate(data.asOfDate)}
                    </span>
                  )}
                </div>

                <div className="portfolio-overdue-aging__bars">
                  {agingBuckets.map((bucket) => (
                    <button
                      key={bucket.key}
                      type="button"
                      className={`portfolio-overdue-aging__row${
                        aging === bucket.key ? ' is-active' : ''
                      }`}
                      onClick={() => {
                        handleAgingChange(
                          aging === bucket.key
                            ? 'all'
                            : bucket.key
                        );
                      }}
                      aria-pressed={aging === bucket.key}
                    >
                      <span className="portfolio-overdue-aging__label">
                        {bucket.label}
                      </span>
                      <span className="portfolio-overdue-aging__track">
                        <span
                          className="portfolio-overdue-aging__fill"
                          style={{
                            width: `${(bucket.count / maxAgingCount) * 100}%`,
                          }}
                        />
                      </span>
                      <strong>{formatPortfolioInteger(bucket.count)}</strong>
                    </button>
                  ))}
                </div>
              </section>

              <section className="portfolio-overdue-table-section">
                <div className="portfolio-overdue-table-toolbar">
                  <div className="portfolio-overdue-table-toolbar__filter">
                    <label
                      className="portfolio-overdue-table-toolbar__label"
                      htmlFor="portfolio-overdue-aging-filter"
                    >
                      Antigüedad
                    </label>
                    <select
                      id="portfolio-overdue-aging-filter"
                      className="portfolio-overdue-table-toolbar__select"
                      value={aging}
                      onChange={(event) => {
                        handleAgingChange(
                          event.target.value as PortfolioOverdueAgingFilter
                        );
                      }}
                    >
                      {availableAgingOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span
                      className="portfolio-overdue-table-toolbar__filter-icon"
                      aria-hidden="true"
                    >
                      <SisgesIcon name="filter" />
                    </span>
                  </div>
                </div>

                {isLoading && (
                  <div
                    className="portfolio-overdue-table__refreshing"
                    role="status"
                  >
                    Actualizando datos desde Analytics...
                  </div>
                )}

                <div className="portfolio-overdue-table">
                  <Table
                    columns={columns}
                    data={table.paginatedData}
                    allData={sortedItems}
                    emptyMessage="No hay promesas vencidas para los filtros seleccionados."
                    enableColumnFilters
                    textFilters={table.textFilters}
                    selectedFilters={table.selectedFilters}
                    onTextFilterChange={table.onTextFilterChange}
                    onSelectedFilterChange={table.onSelectedFilterChange}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                    fitToPanel
                  />
                </div>

                {table.totalRecords > 0 && (
                  <div className="portfolio-overdue-table__pagination">
                    <Paginacion
                      paginaActual={table.pageNumber}
                      totalPaginas={table.totalPages}
                      totalRegistros={table.totalRecords}
                      indiceInicio={indiceInicio}
                      indiceFin={indiceFin}
                      onPaginaAnterior={() => {
                        table.setPageNumber(table.pageNumber - 1);
                      }}
                      onPaginaSiguiente={() => {
                        table.setPageNumber(table.pageNumber + 1);
                      }}
                      onIrAPagina={table.setPageNumber}
                      showPageSizeSelector
                      pageSize={table.pageSize}
                      pageSizeOptions={[5, 10, 25, 50]}
                      onPageSizeChange={table.setPageSize}
                    />
                  </div>
                )}
              </section>
            </>
          )}
        </TableResourceState>
      </div>
    </Modal>
  );
};

export default PortfolioOverduePromisesModal;
