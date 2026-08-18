import type React from 'react';

import Modal from '@shared/components/modals/Modal';
import { SisgesIcon } from '@shared/icons/sisges';

import type {
  PortfolioTargetProgress,
} from '../../../types/portfolioControlCenter.types';
import {
  formatPortfolioCompactCurrency,
  formatPortfolioCurrency,
  formatPortfolioPercentage,
} from '../utils/portfolioControlCenter.formatters';

interface PortfolioRecoveryPaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: PortfolioTargetProgress;
  recoveredAmount: number;
}

type RecoveryPaceTone =
  | 'critical'
  | 'positive'
  | 'neutral';

const clampPercentage = (value: number): number => {
  return Math.min(100, Math.max(0, value));
};

const getGapMessage = (gapRate: number | null): string => {
  if (gapRate === null) {
    return 'Brecha porcentual no disponible';
  }

  const absoluteGap = formatPortfolioPercentage(
    Math.abs(gapRate)
  );

  if (gapRate < 0) {
    return `${absoluteGap} por debajo del ritmo esperado`;
  }

  if (gapRate > 0) {
    return `${absoluteGap} por encima del ritmo esperado`;
  }

  return 'En línea con el ritmo esperado';
};

const getStatusTone = (
  gapAmount: number
): RecoveryPaceTone => {
  if (gapAmount < 0) {
    return 'critical';
  }

  if (gapAmount > 0) {
    return 'positive';
  }

  return 'neutral';
};

export const PortfolioRecoveryPaceModal: React.FC<
  PortfolioRecoveryPaceModalProps
> = ({
  isOpen,
  onClose,
  target,
  recoveredAmount,
}) => {
  const paceAchievementRate =
    target.paceAchievementRate ?? 0;
  const progressWidth = clampPercentage(
    paceAchievementRate
  );
  const statusTone = getStatusTone(target.gapAmount);
  const statusIcon =
    statusTone === 'critical'
      ? 'warning'
      : statusTone === 'positive'
        ? 'success'
        : 'analytics';

  return (
    <Modal
      isOpen={isOpen}
      title="Ritmo de recuperación"
      onClose={onClose}
      size="lg"
    >
      <div className="portfolio-recovery-modal">
        <div
          className={`portfolio-recovery-modal__hero portfolio-recovery-modal__hero--${statusTone}`}
        >
          <span
            className="portfolio-recovery-modal__hero-icon"
            aria-hidden="true"
          >
            <SisgesIcon name={statusIcon} />
          </span>
          <div>
            <span className="portfolio-recovery-modal__eyebrow">
              Situación al corte
            </span>
            <h3>{getGapMessage(target.gapRate)}</h3>
            <p>
              Se han recuperado{' '}
              <strong>
                {formatPortfolioCompactCurrency(
                  recoveredAmount
                )}
              </strong>{' '}
              de los{' '}
              <strong>
                {formatPortfolioCompactCurrency(
                  target.expectedToDateAmount
                )}
              </strong>{' '}
              esperados a esta fecha.
            </p>
          </div>
        </div>

        <div className="portfolio-recovery-modal__metrics">
          <article className="portfolio-recovery-metric portfolio-recovery-metric--actual">
            <span
              className="portfolio-recovery-metric__icon"
              aria-hidden="true"
            >
              <SisgesIcon name="money" />
            </span>
            <div>
              <span>Recuperado</span>
              <strong>
                {formatPortfolioCurrency(recoveredAmount)}
              </strong>
            </div>
          </article>

          <article className="portfolio-recovery-metric portfolio-recovery-metric--expected">
            <span
              className="portfolio-recovery-metric__icon"
              aria-hidden="true"
            >
              <SisgesIcon name="target" />
            </span>
            <div>
              <span>Esperado al corte</span>
              <strong>
                {formatPortfolioCurrency(
                  target.expectedToDateAmount
                )}
              </strong>
            </div>
          </article>

          <article
            className={`portfolio-recovery-metric portfolio-recovery-metric--gap portfolio-recovery-metric--${statusTone}`}
          >
            <span
              className="portfolio-recovery-metric__icon"
              aria-hidden="true"
            >
              <SisgesIcon name="analytics" />
            </span>
            <div>
              <span>Brecha</span>
              <strong>
                {formatPortfolioCurrency(target.gapAmount)}
              </strong>
            </div>
          </article>
        </div>

        <section className="portfolio-recovery-progress-card">
          <div className="portfolio-recovery-progress-card__heading">
            <div>
              <span>Cumplimiento del ritmo</span>
              <strong>
                {formatPortfolioPercentage(
                  target.paceAchievementRate
                )}
              </strong>
            </div>
            <span
              className={`portfolio-recovery-progress-card__status portfolio-recovery-progress-card__status--${statusTone}`}
            >
              {getGapMessage(target.gapRate)}
            </span>
          </div>

          <div
            className="portfolio-recovery-progress"
            role="progressbar"
            aria-label="Cumplimiento del ritmo esperado de recuperación"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progressWidth)}
          >
            <span
              className={`portfolio-recovery-progress__fill portfolio-recovery-progress__fill--${statusTone}`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>

          <div className="portfolio-recovery-progress-card__scale">
            <span>
              Recuperado{' '}
              <strong>
                {formatPortfolioCompactCurrency(
                  recoveredAmount
                )}
              </strong>
            </span>
            <span>
              Esperado{' '}
              <strong>
                {formatPortfolioCompactCurrency(
                  target.expectedToDateAmount
                )}
              </strong>
            </span>
          </div>

          <div className="portfolio-recovery-progress-card__formula">
            <SisgesIcon name="analytics" aria-hidden="true" />
            <span>
              {formatPortfolioCompactCurrency(
                recoveredAmount
              )}{' '}
              ÷{' '}
              {formatPortfolioCompactCurrency(
                target.expectedToDateAmount
              )}{' '}
              ={' '}
              <strong>
                {formatPortfolioPercentage(
                  target.paceAchievementRate
                )}
              </strong>
            </span>
          </div>
        </section>

        <div className="portfolio-recovery-modal__monthly-summary">
          <article>
            <span
              className="portfolio-recovery-modal__summary-icon"
              aria-hidden="true"
            >
              <SisgesIcon name="target" />
            </span>
            <div>
              <span>Meta mensual</span>
              <strong>
                {formatPortfolioCurrency(
                  target.monthlyTargetAmount
                )}
              </strong>
            </div>
          </article>

          <article>
            <span
              className="portfolio-recovery-modal__summary-icon"
              aria-hidden="true"
            >
              <SisgesIcon name="bar-chart" />
            </span>
            <div>
              <span>Avance de la meta mensual</span>
              <strong>
                {formatPortfolioPercentage(
                  target.targetAchievementRate
                )}
              </strong>
            </div>
          </article>
        </div>

        <aside className="portfolio-recovery-modal__explanation">
          <span aria-hidden="true">
            <SisgesIcon name="history" />
          </span>
          <div>
            <strong>¿Cómo se interpreta?</strong>
            <p>
              El esperado al corte representa cuánto debería haberse recuperado de la meta mensual según los días hábiles transcurridos. Analytics realiza este cálculo con su calendario operativo. El cumplimiento del ritmo compara el recaudo acumulado real contra ese monto esperado.
            </p>
          </div>
        </aside>
      </div>
    </Modal>
  );
};

export default PortfolioRecoveryPaceModal;
