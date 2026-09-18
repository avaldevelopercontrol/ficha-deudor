import type { Column } from '@shared/types';
import { SisgesIcon } from '@shared/icons/sisges';

import type {
  SeguimientoPromesaCarteraItem,
  SeguimientoPromesasCarteraPeriodo,
} from '../domain/promesasCartera.types';
import {
  formatPortfolioCurrency,
  formatPortfolioInteger,
} from '../utils/centroControlCartera.formatters';
import {
  formatPortfolioPromiseDate,
  getSeguimientoPromesaEmptyActivityLabel,
  getSeguimientoPromesaStatusLabel,
} from '../utils/detallePromesaCartera.utils';

interface BuildSeguimientoPromesasCarteraColumnsParams {
  dueDate: string;
  period: SeguimientoPromesasCarteraPeriodo;
}

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

export const buildSeguimientoPromesasCarteraColumns = ({
  dueDate,
  period,
}: BuildSeguimientoPromesasCarteraColumnsParams): Column<SeguimientoPromesaCarteraItem>[] => {
  const isToday = period === 'today';

  return [
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
  ];
};
