import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  resolveGestionDeudorIdentity,
} from './gestionDeudorIdentity.utils';

export const suite = defineSuite(
  'gestionDeudorIdentity.utils',
  [
    test('normaliza una identidad válida de gestión deudor', () => {
      assert.deepEqual(
        resolveGestionDeudorIdentity(
          ' 025 ',
          ' 070 '
        ),
        {
          idCliente: '25',
          idUsuario: '70',
        }
      );
    }),
    test('acepta identificadores numéricos y los normaliza al contrato interno string', () => {
      assert.deepEqual(
        resolveGestionDeudorIdentity(25, 70),
        {
          idCliente: '25',
          idUsuario: '70',
        }
      );
    }),
    test('rechaza identidades incompletas o inválidas', () => {
      for (const value of [
        null,
        undefined,
        '',
        '0',
        '-1',
        '1.5',
        '1e3',
        'abc',
      ]) {
        assert.equal(
          resolveGestionDeudorIdentity(
            value,
            '70'
          ),
          null
        );
        assert.equal(
          resolveGestionDeudorIdentity(
            '25',
            value
          ),
          null
        );
      }
    }),
  ]
);
