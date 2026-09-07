import assert from 'node:assert/strict';

import { createDeudorGestion } from '../../../../../test/factories/gestionDeudor.factory';
import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import { resolveFichaDeudorParams } from './gestionDeudorNavigation.utils';

const identity = {
  idCliente: '99',
  idUsuario: '50',
};

export const suite = defineSuite(
  'gestionDeudorNavigation.utils',
  [
    test('construye todos los parámetros requeridos por la ficha', () => {
      const params = resolveFichaDeudorParams({
        row: createDeudorGestion(),
        identity,
        fechaInicioGestion: new Date(
          '2026-08-04T14:20:30.000Z'
        ),
      });

      assert.deepEqual(params, {
        id_cliente: '10',
        id_cartera: '30',
        id_deudor: '301',
        id_contrato: '20',
        id_usuario: '50',
        fecha_inicio_gestion:
          '2026-08-04T14:20:30.000Z',
      });
    }),
    test('usa el cliente autenticado cuando el registro no incluye cliente', () => {
      const params = resolveFichaDeudorParams({
        row: createDeudorGestion({ idCliente: 0 }),
        identity,
        fechaInicioGestion: new Date(
          '2026-08-04T14:20:30.000Z'
        ),
      });

      assert.equal(params?.id_cliente, '99');
    }),
    test('rechaza parámetros inválidos sin lanzar excepciones durante la navegación', () => {
      assert.equal(
        resolveFichaDeudorParams({
          row: createDeudorGestion({ idCartera: 0 }),
          identity,
        }),
        null
      );

      assert.equal(
        resolveFichaDeudorParams({
          row: createDeudorGestion({ idCliente: 0 }),
          identity: {
            idCliente: '0',
            idUsuario: '50',
          },
        }),
        null
      );

      assert.equal(
        resolveFichaDeudorParams({
          row: createDeudorGestion(),
          identity: {
            idCliente: '99',
            idUsuario: '0',
          },
        }),
        null
      );
    }),
    test('no altera los identificadores válidos del registro seleccionado', () => {
      const params = resolveFichaDeudorParams({
        row: createDeudorGestion({
          idCartera: 88,
          idDeudor: 77,
          idContrato: 66,
        }),
        identity,
        fechaInicioGestion: new Date(
          '2026-08-04T14:20:30.000Z'
        ),
      });

      assert.equal(params?.id_cartera, '88');
      assert.equal(params?.id_deudor, '77');
      assert.equal(params?.id_contrato, '66');
    }),
  ]
);
