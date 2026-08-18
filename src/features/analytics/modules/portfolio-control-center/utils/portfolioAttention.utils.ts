import type {
  PortfolioAttentionItem,
  PortfolioPromiseStatus,
  PortfolioTargetProgress,
} from '../../../types/portfolioControlCenter.types';

export const buildPortfolioOperationalAttention = (
  target: PortfolioTargetProgress | null,
  promises: PortfolioPromiseStatus
): readonly PortfolioAttentionItem[] => {
  const attention: PortfolioAttentionItem[] = [];

  if (target?.gapRate !== null && target?.gapRate !== undefined) {
    attention.push({
      id: 'curve-gap',
      title: 'Ritmo de recuperación',
      detail:
        'Comparación del recaudo acumulado contra el ritmo esperado al corte.',
      metric: 'curveGap',
      tone: target.gapRate < 0 ? 'critical' : 'positive',
      value: target.gapRate,
    });
  }

  if (promises.overdueCount > 0) {
    attention.push({
      id: 'promises-overdue',
      title: 'Promesas vencidas',
      detail:
        'Compromisos vencidos que requieren priorización operativa.',
      metric: 'promisesOverdue',
      tone: 'critical',
      value: promises.overdueCount,
    });
  }

  if (promises.dueTodayCount > 0) {
    attention.push({
      id: 'promises-due-today',
      title: 'Promesas con vencimiento hoy',
      detail:
        'Compromisos que requieren seguimiento durante el corte actual.',
      metric: 'promisesDue',
      tone: 'warning',
      value: promises.dueTodayCount,
      amount: promises.dueTodayAmount,
    });
  }

  return attention;
};
