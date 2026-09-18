import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  buildProduccionResumenEndpoint,
  PRODUCCION_ONLINE_API_ENDPOINTS,
} from './produccionOnlineApi.endpoints';

export const suite = defineSuite(
  'produccionOnlineApi.endpoints',
  [
    test(
      'construye el endpoint del resumen con los cuatro filtros canónicos',
      () => {
        const endpoint =
          buildProduccionResumenEndpoint({
            idCliente: 208,
            idPerfil: 2,
            idUbigeo: 1379,
            idTipoLlamada: -1,
          });
        const url = new URL(
          endpoint,
          'http://localhost'
        );

        assert.equal(
          url.pathname,
          PRODUCCION_ONLINE_API_ENDPOINTS.resumen
        );
        assert.deepEqual(
          Array.from(
            url.searchParams.entries()
          ),
          [
            ['nId_Cliente', '208'],
            ['nId_Perfil', '2'],
            ['nId_Ubigeo', '1379'],
            ['nId_TipoLlamada', '-1'],
          ]
        );
      }
    ),
  ]
);
