import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { createCliente } from '../../../test/factories/auth.factory';
import { clienteToSelectOptions } from './clienteOptions.utils';

export const suite = defineSuite('clienteOptions.utils', [
  test('convierte clientes a opciones sin alterar su orden', () => {
    const options = clienteToSelectOptions([
      createCliente({ id_cliente: '95', nombre: 'CLARO' }),
      createCliente({ id_cliente: '12', nombre: 'MOVISTAR' }),
    ]);

    assert.deepEqual(options, [
      { id: '95', label: 'CLARO' },
      { id: '12', label: 'MOVISTAR' },
    ]);
  }),
  test('mantiene una colección vacía cuando no hay clientes', () => {
    assert.deepEqual(clienteToSelectOptions([]), []);
  }),
]);
