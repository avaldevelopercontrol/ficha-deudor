import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  mapClientesActivosResponse,
} from './clienteActivo.mapper';

export const suite = defineSuite(
  'clienteActivo.mapper',
  [
    test(
      'normaliza los clientes activos recibidos desde la API',
      () => {
        assert.deepEqual(
          mapClientesActivosResponse([
            {
              nId_Cliente: 178,
              cCli_Nombre:
                ' ADEX INSTITUTO ',
            },
          ]),
          [
            {
              idCliente: 178,
              nombreCliente:
                'ADEX INSTITUTO',
            },
          ]
        );
      }
    ),
    test(
      'descarta clientes sin identificador o nombre válido',
      () => {
        assert.deepEqual(
          mapClientesActivosResponse([
            {
              nId_Cliente: 0,
              cCli_Nombre:
                'Cliente inválido',
            },
            {
              nId_Cliente: 1,
              cCli_Nombre: '   ',
            },
          ]),
          []
        );
      }
    ),
  ]
);
