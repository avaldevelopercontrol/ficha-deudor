import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  AnalyticsOptionReportClientPublication,
} from '@features/analytics/access/api/analyticsAccessAdmin.api';

import {
  buildReportClientPublicationIndex,
  buildReportClientPublicationKey,
  getChangedReportClientPublications,
  mergeReportClientPublicationDrafts,
} from './powerBiReportClientPublications.utils';

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
    'https://app.powerbi.com/view?r=old',
  isReady: true,
  ...overrides,
});

export const suite = defineSuite(
  'powerBiReportClientPublications.utils',
  [
    test(
      'preserva AUTO_DETECTED cuando solo cambia la URL Publish to web',
      () => {
        const configured = createPublication();
        const current = createPublication({
          embedUrl:
            'https://app.powerbi.com/view?r=new',
        });

        assert.deepEqual(
          getChangedReportClientPublications(
            [current],
            [configured]
          ),
          [
            {
              clientId: 178,
              name: 'ADEX INSTITUTO',
              groupIds: null,
              embedUrl:
                'https://app.powerbi.com/view?r=new',
            },
          ]
        );
      }
    ),
    test(
      'envía los grupos cuando el administrador cambia explícitamente el scope de la cartera',
      () => {
        const configured = createPublication({
          groupResolution: 'CONFIGURED',
          hasExplicitGroupConfiguration: true,
          groupIds: [219],
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
        });
        const current = createPublication({
          groupResolution: 'CONFIGURED',
          hasExplicitGroupConfiguration: true,
          groupIds: [219, 220],
          candidateGroups:
            configured.candidateGroups,
        });

        assert.deepEqual(
          getChangedReportClientPublications(
            [current],
            [configured]
          ),
          [
            {
              clientId: 178,
              name: 'ADEX INSTITUTO',
              groupIds: [219, 220],
              embedUrl:
                'https://app.powerbi.com/view?r=old',
            },
          ]
        );
      }
    ),
    test(
      'no genera payload si URL y grupos permanecen sin cambios',
      () => {
        const configured = createPublication();

        assert.deepEqual(
          getChangedReportClientPublications(
            [createPublication()],
            [configured]
          ),
          []
        );
      }
    ),
    test(
      'indexa la publicación con una clave canónica estable',
      () => {
        const publication = createPublication({
          name: '  ADEX INSTITUTO  ',
        });
        const index =
          buildReportClientPublicationIndex([
            publication,
          ]);

        assert.equal(
          index.get(
            buildReportClientPublicationKey(
              178,
              'adex instituto'
            )
          ),
          publication
        );
      }
    ),
    test(
      'combina drafts sin recrear las filas que no fueron editadas',
      () => {
        const first = createPublication();
        const second = createPublication({
          clientId: 179,
          name: 'ALFIN BANCO',
        });
        const editedFirst = {
          ...first,
          embedUrl:
            'https://app.powerbi.com/view?r=edited',
        };
        const drafts = new Map([
          [
            buildReportClientPublicationKey(
              first.clientId,
              first.name
            ),
            editedFirst,
          ],
        ]);

        const merged =
          mergeReportClientPublicationDrafts(
            [first, second],
            drafts
          );

        assert.equal(merged[0], editedFirst);
        assert.equal(merged[1], second);
      }
    ),
  ]
);
