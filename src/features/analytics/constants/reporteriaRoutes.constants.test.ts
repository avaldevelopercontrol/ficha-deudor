import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  buildReporteriaBiRoute,
} from './reporteriaRoutes.constants';

export const suite = defineSuite(
  'reporteriaRoutes.constants',
  [
    test(
      'construye la ruta del BI sin selección de cartera',
      () => {
        assert.equal(
          buildReporteriaBiRoute(27),
          '/analytics/reporteria/bi/27'
        );
      }
    ),
    test(
      'preserva cliente y valor del reporte para distinguir carteras con el mismo clientId',
      () => {
        const route =
          buildReporteriaBiRoute(
            27,
            {
              clientId: 73,
              name: 'ORIFLAME ADELANTADA',
            }
          );

        const url = new URL(
          route,
          'http://localhost'
        );

        assert.equal(
          url.pathname,
          '/analytics/reporteria/bi/27'
        );
        assert.equal(
          url.searchParams.get('clientId'),
          '73'
        );
        assert.equal(
          url.searchParams.get('reportClient'),
          'ORIFLAME ADELANTADA'
        );
      }
    ),
  ]
);
