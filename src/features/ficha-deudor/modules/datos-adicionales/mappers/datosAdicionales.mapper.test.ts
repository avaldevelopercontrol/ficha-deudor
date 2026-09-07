import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import { mapCabeceraDatosAdicionalesToColumns } from './datosAdicionales.mapper';

export const suite = defineSuite('datosAdicionales.mapper', [
  test('omite idCab y valores dinámicos nulos/no escalares', () => {
    const result = mapCabeceraDatosAdicionalesToColumns({
      idCab: null,
      cliente: 'Cliente',
      campoNulo: null,
      objeto: { label: 'No usar' },
    });

    assert.deepEqual(result, [
      { key: 'cliente', label: 'Cliente', type: 'text' },
    ]);
  }),
  test('infiere money, atraso, date y estado desde la clave', () => {
    const result = mapCabeceraDatosAdicionalesToColumns({
      montoPendiente: 'Pendiente',
      diasAtraso: 'Mora',
      fechaVencimiento: 'Vencimiento',
      estadoServicio: 'Situación',
    });

    assert.deepEqual(
      result.map(({ key, type }) => ({ key, type })),
      [
        { key: 'montoPendiente', type: 'money' },
        { key: 'diasAtraso', type: 'atraso' },
        { key: 'fechaVencimiento', type: 'date' },
        { key: 'estadoServicio', type: 'estado' },
      ]
    );
  }),
  test('infiere money desde el label cuando la clave no es descriptiva', () => {
    const result = mapCabeceraDatosAdicionalesToColumns({
      campo01: 'Saldo Total',
    });

    assert.equal(result[0]?.type, 'money');
  }),
]);
