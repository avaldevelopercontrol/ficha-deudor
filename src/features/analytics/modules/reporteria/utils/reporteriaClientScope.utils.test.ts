import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  findAuthorizedReportClient,
  parseReportClientSelection,
} from './reporteriaClientScope.utils';

const clients = [
  {
    clientId: 73,
    name: 'ORIFLAME',
  },
  {
    clientId: 73,
    name: 'ORIFLAME ADELANTADA',
  },
  {
    clientId: 52,
    name: 'NATURA',
  },
];

export const suite = defineSuite(
  'reporteriaClientScope.utils',
  [
    test(
      'lee clientId y reportClient desde la URL',
      () => {
        const selection =
          parseReportClientSelection(
            new URLSearchParams(
              'clientId=73&reportClient=ORIFLAME+ADELANTADA'
            )
          );

        assert.deepEqual(selection, {
          clientId: 73,
          name: 'ORIFLAME ADELANTADA',
        });
      }
    ),
    test(
      'rechaza una selección incompleta o con clientId inválido',
      () => {
        assert.equal(
          parseReportClientSelection(
            new URLSearchParams(
              'clientId=0&reportClient=NATURA'
            )
          ),
          null
        );
        assert.equal(
          parseReportClientSelection(
            new URLSearchParams(
              'clientId=52'
            )
          ),
          null
        );
      }
    ),
    test(
      'autoriza por clientId y valor canónico del reporte, distinguiendo clientes repetidos',
      () => {
        assert.deepEqual(
          findAuthorizedReportClient(
            clients,
            {
              clientId: 73,
              name: 'oriflame adelantada',
            }
          ),
          {
            clientId: 73,
            name: 'ORIFLAME ADELANTADA',
          }
        );

        assert.equal(
          findAuthorizedReportClient(
            clients,
            {
              clientId: 73,
              name: 'NATURA',
            }
          ),
          null
        );
      }
    ),
  ]
);
