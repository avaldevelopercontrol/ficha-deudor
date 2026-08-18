import type React from 'react';
import { useState } from 'react';

import {
  SisgesIcon,
  type SisgesIconName,
} from '@shared/icons/sisges';
import type {
  PortfolioAttentionItem,
  PortfolioAttentionTone,
  PortfolioOperationalContext,
  PortfolioTargetProgress,
} from '../../../types/portfolioControlCenter.types';
import {
  formatPortfolioCompactCurrency,
  formatPortfolioCurrency,
  formatPortfolioInteger,
  formatPortfolioPercentage,
  formatPortfolioSignedPercentage,
} from '../utils/portfolioControlCenter.formatters';
import {
  PortfolioOverduePromisesModal,
} from './PortfolioOverduePromisesModal';
import {
  PortfolioDueTodayPromisesModal,
} from './PortfolioDueTodayPromisesModal';
import {
  PortfolioRecoveryPaceModal,
} from './PortfolioRecoveryPaceModal';

interface PortfolioAttentionPanelProps {
  items: readonly PortfolioAttentionItem[];
  target: PortfolioTargetProgress | null;
  recoveredAmount: number | null;
  context: Pick<
    PortfolioOperationalContext,
    'campaignId' | 'subPortfolioId'
  > | null;
}

const getMetricLabel = (
  item: PortfolioAttentionItem
): string => {
  switch (item.metric) {
    case 'curveGap': {
      const absoluteGap = formatPortfolioPercentage(
        Math.abs(item.value)
      );

      if (item.value < 0) {
        return `${absoluteGap} por debajo`;
      }

      if (item.value > 0) {
        return `${absoluteGap} por encima`;
      }

      return 'En línea';
    }
    case 'promisesDue':
      return `${formatPortfolioInteger(
        item.value
      )} vencen hoy`;
    case 'promisesOverdue':
      return `${formatPortfolioInteger(
        item.value
      )} vencidas`;
    case 'targetPace':
      return `${formatPortfolioSignedPercentage(
        item.value
      )} vs ritmo`;
    case 'contactability':
      return `Contactabilidad ${formatPortfolioPercentage(
        item.value
      )}`;
  }
};

const getAttentionIcon = (
  tone: PortfolioAttentionTone
): SisgesIconName => {
  switch (tone) {
    case 'critical':
      return 'warning';
    case 'warning':
      return 'notification';
    case 'positive':
      return 'success';
  }
};

const getAttentionDetail = (
  item: PortfolioAttentionItem,
  target: PortfolioTargetProgress | null,
  recoveredAmount: number | null
): string => {
  if (
    item.metric === 'curveGap' &&
    target &&
    recoveredAmount !== null
  ) {
    return `Se han recuperado ${formatPortfolioCompactCurrency(
      recoveredAmount
    )} de los ${formatPortfolioCompactCurrency(
      target.expectedToDateAmount
    )} esperados al corte.`;
  }

  if (item.metric === 'promisesOverdue') {
    return `${formatPortfolioInteger(
      item.value
    )} compromisos requieren atención y priorización operativa.`;
  }

  return item.detail;
};

export const PortfolioAttentionPanel: React.FC<
  PortfolioAttentionPanelProps
> = ({ items, target, recoveredAmount, context }) => {
  const [isRecoveryPaceOpen, setIsRecoveryPaceOpen] =
    useState(false);
  const [isOverduePromisesOpen, setIsOverduePromisesOpen] =
    useState(false);
  const [isDueTodayPromisesOpen, setIsDueTodayPromisesOpen] =
    useState(false);

  const canOpenRecoveryPace =
    target !== null && recoveredAmount !== null;
  const canOpenOverduePromises = context !== null;
  const canOpenDueTodayPromises = context !== null;

  return (
    <section className="portfolio-control-center__section portfolio-control-center__section--attention">
      <div className="portfolio-control-center__section-heading portfolio-control-center__section-heading--compact">
        <h2>
          <span
            className="portfolio-heading-icon portfolio-heading-icon--attention"
            aria-hidden="true"
          >
            <SisgesIcon name="warning" />
          </span>
          Requiere atención
        </h2>
        <p>
          Señales operativas para actuar durante el día, no solo al cierre.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="portfolio-attention-empty">
          No hay señales para los filtros seleccionados.
        </div>
      ) : (
        <div className="portfolio-attention-list">
          {items.map((item) => {
            const canOpenDetail =
              (item.metric === 'curveGap' && canOpenRecoveryPace) ||
              (item.metric === 'promisesOverdue' &&
                canOpenOverduePromises) ||
              (item.metric === 'promisesDue' &&
                canOpenDueTodayPromises);

            const detailAction =
              item.metric === 'curveGap'
                ? 'Ver detalle del ritmo'
                : item.metric === 'promisesOverdue' ||
                    item.metric === 'promisesDue'
                  ? 'Ver detalle de promesas'
                  : null;

            const content = (
              <>
                <span
                  className="portfolio-attention-item__icon"
                  aria-hidden="true"
                >
                  <SisgesIcon
                    name={getAttentionIcon(item.tone)}
                  />
                </span>

                <div className="portfolio-attention-item__content">
                  <div className="portfolio-attention-item__header">
                    <strong>{item.title}</strong>
                    <span>{getMetricLabel(item)}</span>
                  </div>
                  <p>
                    {getAttentionDetail(
                      item,
                      target,
                      recoveredAmount
                    )}
                  </p>
                  {typeof item.amount === 'number' && (
                    <span className="portfolio-attention-item__amount">
                      Monto comprometido:{' '}
                      {formatPortfolioCurrency(item.amount)}
                    </span>
                  )}
                  {canOpenDetail && detailAction && (
                    <span className="portfolio-attention-item__action">
                      {detailAction}
                      <span aria-hidden="true">→</span>
                    </span>
                  )}
                </div>
              </>
            );

            if (canOpenDetail) {
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`portfolio-attention-item portfolio-attention-item--interactive portfolio-attention-item--${item.tone}`}
                  onClick={() => {
                    if (item.metric === 'curveGap') {
                      setIsRecoveryPaceOpen(true);
                      return;
                    }

                    if (item.metric === 'promisesOverdue') {
                      setIsOverduePromisesOpen(true);
                      return;
                    }

                    if (item.metric === 'promisesDue') {
                      setIsDueTodayPromisesOpen(true);
                    }
                  }}
                  aria-label={`${item.title}. ${getMetricLabel(
                    item
                  )}. ${detailAction}.`}
                >
                  {content}
                </button>
              );
            }

            return (
              <article
                key={item.id}
                className={`portfolio-attention-item portfolio-attention-item--${item.tone}`}
              >
                {content}
              </article>
            );
          })}
        </div>
      )}

      {target && recoveredAmount !== null && (
        <PortfolioRecoveryPaceModal
          isOpen={isRecoveryPaceOpen}
          onClose={() => {
            setIsRecoveryPaceOpen(false);
          }}
          target={target}
          recoveredAmount={recoveredAmount}
        />
      )}

      {context && isOverduePromisesOpen && (
        <PortfolioOverduePromisesModal
          key={`${context.campaignId}-${context.subPortfolioId ?? 'all'}`}
          isOpen
          onClose={() => {
            setIsOverduePromisesOpen(false);
          }}
          context={context}
        />
      )}
      {context && isDueTodayPromisesOpen && (
        <PortfolioDueTodayPromisesModal
          key={`${context.campaignId}-${context.subPortfolioId ?? 'all'}-due-today`}
          isOpen
          onClose={() => {
            setIsDueTodayPromisesOpen(false);
          }}
          context={context}
        />
      )}

    </section>
  );
};
