import type React from 'react';
import { useMemo } from 'react';

import { SisgesIcon } from '@shared/icons/sisges';

import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import {
  useSeguimientoPromesasCarteraModalController,
} from '../hooks/useSeguimientoPromesasCarteraModalController';
import {
  formatPortfolioCurrency,
  formatPortfolioInteger,
} from '../utils/centroControlCartera.formatters';
import {
  formatSeguimientoPromesasPeriodLabel,
  getSeguimientoPromesasCarteraDate,
} from '../utils/detallePromesaCartera.utils';
import { DetallePromesaCarteraModalFrame } from './DetallePromesaCarteraModalFrame';
import { PortfolioPromiseDistribution } from './PortfolioPromiseDistribution';
import { PortfolioPromiseSummary } from './PortfolioPromiseSummary';
import { PortfolioPromiseTableSection } from './PortfolioPromiseTableSection';
import {
  buildSeguimientoPromesasCarteraColumns,
} from './seguimientoPromesasCarteraColumns';

interface SeguimientoPromesasCarteraModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  > & { crmClientId: number };
  operationAsOfAt?: string | null;
}

export const SeguimientoPromesasCarteraModal: React.FC<
  SeguimientoPromesasCarteraModalProps
> = ({ isOpen, onClose, context, operationAsOfAt = null }) => {
  const {
    period,
    dueDate,
    isToday,
    visibleData,
    isLoading,
    error,
    refetch,
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
    isExporting,
    exportError,
    lastExportedCount,
    exportExcel,
  } = useSeguimientoPromesasCarteraModalController({
    isOpen,
    onClose,
    context,
    operationAsOfAt,
  });

  const columns = useMemo(
    () =>
      buildSeguimientoPromesasCarteraColumns({
        dueDate,
        period,
      }),
    [dueDate, period]
  );

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
            toolbarLeadingContent={
              canExport ? (
                <button
                  type="button"
                  className="portfolio-promise-tracking-export-button"
                  onClick={() => {
                    void exportExcel();
                  }}
                  disabled={
                    isExporting ||
                    isLoading ||
                    visibleData.pagination.totalItems <= 0
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
                  className="portfolio-promise-tracking-export-status is-error"
                  role="alert"
                >
                  {exportError}
                </div>
              ) : lastExportedCount !== null ? (
                <div
                  className="portfolio-promise-tracking-export-status is-success"
                  role="status"
                >
                  Excel generado con {formatPortfolioInteger(lastExportedCount)} registro(s).
                </div>
              ) : null
            }
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
