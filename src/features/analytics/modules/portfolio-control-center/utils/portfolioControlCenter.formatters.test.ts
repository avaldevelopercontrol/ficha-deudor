import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  calculatePortfolioRate,
  formatPortfolioCompactCurrency,
  formatPortfolioInteger,
  formatPortfolioPercentage,
  formatPortfolioIntensityPercentage,
  formatPortfolioSignedPercentage,
  formatPortfolioPeriod,
  formatPortfolioUpdatedAt,
} from './portfolioControlCenter.formatters';

export const suite = defineSuite(
  'portfolioControlCenter.formatters',
  [
    test(
      'formatea cantidades enteras para el dashboard',
      () => {
        assert.equal(
          formatPortfolioInteger(125420),
          '125,420'
        );
      }
    ),
    test(
      'formatea porcentajes con dos decimales',
      () => {
        assert.equal(
          formatPortfolioPercentage(62.372),
          '62.37%'
        );
      }
    ),
    test(
      'formatea intensidad y variaciones con signo',
      () => {
        assert.equal(
          formatPortfolioIntensityPercentage(0.112),
          '11.20%'
        );
        assert.equal(
          formatPortfolioSignedPercentage(11.77),
          '+11.77%'
        );
        assert.equal(
          formatPortfolioSignedPercentage(-11.77),
          '-11.77%'
        );
      }
    ),
    test(
      'calcula el porcentaje de avance sin dividir entre cero',
      () => {
        const rate = calculatePortfolioRate(
          78230,
          125420
        );

        assert.ok(
          Math.abs(rate - 62.3744) < 0.0001
        );
        assert.equal(
          calculatePortfolioRate(0, 0),
          0
        );
      }
    ),
    test(
      'formatea importes compactos y períodos para el gráfico',
      () => {
        assert.equal(
          formatPortfolioCompactCurrency(840250),
          'S/ 840.3K'
        );
        assert.equal(
          formatPortfolioPeriod('2026-08-12'),
          '12 ago'
        );
      }
    ),
    test(
      'muestra el corte de datos en hora de Perú con AM o PM',
      () => {
        assert.equal(
          formatPortfolioUpdatedAt(
            '2026-08-12T16:04:00Z'
          ),
          '12/08/2026, 11:04 AM'
        );
        assert.equal(
          formatPortfolioUpdatedAt(
            '2026-08-12T20:45:00Z'
          ),
          '12/08/2026, 03:45 PM'
        );
      }
    ),
  ]
);
