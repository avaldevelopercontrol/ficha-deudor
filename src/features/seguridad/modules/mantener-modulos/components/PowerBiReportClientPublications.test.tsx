import assert from 'node:assert/strict';

import {
  renderToStaticMarkup,
} from 'react-dom/server';

import type {
  AnalyticsOptionReportClientPublication,
} from '@features/analytics/access/api/analyticsAccessAdmin.api';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import PowerBiReportClientPublications from './PowerBiReportClientPublications';

const createPublication = (
  overrides: Partial<AnalyticsOptionReportClientPublication> = {}
): AnalyticsOptionReportClientPublication => ({
  clientId: 178,
  name: 'ADEX INSTITUTO',
  isAvailable: true,
  groupResolution: 'AUTO_DETECTED',
  hasExplicitGroupConfiguration: false,
  groupIds: [219],
  candidateGroups: [
    {
      groupId: 219,
      name: 'ADEX INSTITUTO',
    },
  ],
  embedUrl:
    'https://app.powerbi.com/view?r=test',
  isReady: true,
  ...overrides,
});

const renderPublications = (
  clients: readonly AnalyticsOptionReportClientPublication[]
): string =>
  renderToStaticMarkup(
    <PowerBiReportClientPublications
      clients={clients}
      onEmbedUrlChange={() => undefined}
      onGroupIdsChange={() => undefined}
    />
  );

export const suite = defineSuite(
  'PowerBiReportClientPublications',
  [
    test(
      'conserva el resumen y estado visual de una cartera lista detectada automáticamente',
      () => {
        const html = renderPublications([
          createPublication(),
        ]);

        assert.match(
          html,
          /Publicaciones por cartera/
        );
        assert.match(html, /1\/1 listas/);
        assert.match(
          html,
          /ADEX INSTITUTO \[219\]/
        );
        assert.match(
          html,
          /Detectado automáticamente por cliente SISGES\./
        );
        assert.match(html, />Listo</);
      }
    ),
    test(
      'mantiene el selector de acceso cuando una cartera tiene varios grupos candidatos',
      () => {
        const html = renderPublications([
          createPublication({
            groupResolution: 'CONFIGURED',
            hasExplicitGroupConfiguration: true,
            groupIds: [219, 220],
            candidateGroups: [
              {
                groupId: 219,
                name: 'ADEX INSTITUTO',
              },
              {
                groupId: 220,
                name: 'ADEX COBRANZA',
              },
            ],
          }),
        ]);

        assert.match(
          html,
          /Configurar acceso \(2 seleccionados\)/
        );
        assert.match(
          html,
          /type="checkbox"/
        );
      }
    ),
  ]
);
