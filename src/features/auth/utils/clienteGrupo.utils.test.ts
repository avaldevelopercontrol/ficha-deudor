import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../test/testHarness';
import { createCliente } from '../../../test/factories/auth.factory';

import {
  buildClienteGrupoSelectionKey,
  resolveClienteGrupoId,
} from './clienteGrupo.utils';

export const suite = defineSuite('clienteGrupo.utils', [
  test('usa el grupo real recibido para el cliente seleccionado', () => {
    assert.equal(
      resolveClienteGrupoId(
        createCliente({
          id_cliente: '95',
          id_grupo: 156,
        })
      ),
      156
    );
  }),
  test('no inventa un grupo cuando el valor recibido no es válido', () => {
    assert.equal(
      resolveClienteGrupoId(
        createCliente({
          id_cliente: '95',
          id_grupo: 0,
        })
      ),
      null
    );
    assert.equal(resolveClienteGrupoId(null), null);
  }),
  test('construye una identidad estable por cliente y grupo', () => {
    assert.equal(
      buildClienteGrupoSelectionKey(
        createCliente({
          id_cliente: '27',
          id_grupo: 168,
        })
      ),
      '27:168'
    );
  }),
]);
