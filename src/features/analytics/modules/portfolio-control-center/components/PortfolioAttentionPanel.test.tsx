import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  PortfolioAttentionItem,
  PortfolioTargetProgress,
} from '../../../types/portfolioControlCenter.types';
import {
  PortfolioAttentionPanel,
} from './PortfolioAttentionPanel';

const TARGET: PortfolioTargetProgress = {
  monthlyTargetAmount: 17_140_742,
  expectedToDateAmount: 7_713_333.9,
  targetAchievementRate: 15.5646,
  paceAchievementRate: 34.5882,
  gapAmount: -5_045_429.0014,
  gapRate: -65.4118,
};


const OVERDUE_ITEMS: readonly PortfolioAttentionItem[] = [
  {
    id: 'promises-overdue',
    title: 'Promesas vencidas',
    detail: 'Detalle técnico.',
    metric: 'promisesOverdue',
    tone: 'critical',
    value: 46,
  },
];

const DUE_TODAY_ITEMS: readonly PortfolioAttentionItem[] = [
  {
    id: 'promises-due',
    title: 'Promesas con vencimiento hoy',
    detail: 'Compromisos que requieren seguimiento durante el corte actual.',
    metric: 'promisesDue',
    tone: 'warning',
    value: 4,
    amount: 283.68,
  },
];

const ITEMS: readonly PortfolioAttentionItem[] = [
  {
    id: 'curve-gap',
    title: 'Ritmo de recuperación',
    detail:
      'Detalle técnico que no debe mostrarse cuando existe contexto ejecutivo.',
    metric: 'curveGap',
    tone: 'critical',
    value: -65.4118,
  },
];

export const suite = defineSuite(
  'PortfolioAttentionPanel',
  [
    test(
      'explica el ritmo en lenguaje ejecutivo y ofrece detalle interactivo',
      () => {
        const html = renderToStaticMarkup(
          <PortfolioAttentionPanel
            items={ITEMS}
            target={TARGET}
            recoveredAmount={2_667_904.9}
            context={null}
          />
        );

        assert.match(html, /65\.41% por debajo/);
        assert.match(html, /esperados al corte/);
        assert.match(html, /Ver detalle del ritmo/);
        assert.doesNotMatch(html, /vs curva/);
      }
    ),
    test(
      'ofrece drill-down de promesas vencidas cuando existe contexto Analytics',
      () => {
        const html = renderToStaticMarkup(
          <PortfolioAttentionPanel
            items={OVERDUE_ITEMS}
            target={null}
            recoveredAmount={null}
            context={{
              campaignId: '2026-08',
              subPortfolioId: '29',
            }}
          />
        );

        assert.match(html, /46 vencidas/);
        assert.match(html, /46 compromisos requieren atención/);
        assert.match(html, /Ver detalle de promesas/);
      }
    ),
    test(
      'ofrece drill-down de promesas con vencimiento hoy y conserva el monto comprometido',
      () => {
        const html = renderToStaticMarkup(
          <PortfolioAttentionPanel
            items={DUE_TODAY_ITEMS}
            target={null}
            recoveredAmount={null}
            context={{
              campaignId: '2026-08',
              subPortfolioId: '29',
            }}
          />
        );

        assert.match(html, /4 vencen hoy/);
        assert.match(html, /Monto comprometido/);
        assert.match(html, /S\/\s*283\.68/);
        assert.match(html, /Ver detalle de promesas/);
      }
    ),
  ]
);
