import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import { mapGestionBotones } from './gestionBotones.mapper';

export const suite = defineSuite('gestionBotones.mapper', [
  test('mapea solo botones activos y evita duplicar el prefijo visual', () => {
    const result = mapGestionBotones([
      {
        nId_Boton: 1,
        nId_Cliente: 95,
        nId_Contrato: 182,
        nombreBoton: 'estadoCuenta',
        descripcionBoton: '+ ESTADO CUENTA',
        bEstado: true,
      },
      {
        nId_Boton: 2,
        nId_Cliente: 95,
        nId_Contrato: 182,
        nombreBoton: 'pagos',
        descripcionBoton: '+ PAGOS',
        bEstado: false,
      },
    ]);

    assert.deepEqual(result, [
      {
        id: 1,
        nombre: 'estadoCuenta',
        label: 'ESTADO CUENTA',
      },
    ]);
  }),
  test('usa el nombre técnico como etiqueta cuando la descripción está vacía', () => {
    const result = mapGestionBotones([
      {
        nId_Boton: 9,
        nId_Cliente: 95,
        nId_Contrato: 182,
        nombreBoton: 'nuevoModulo',
        descripcionBoton: '   ',
        bEstado: true,
      },
    ]);

    assert.deepEqual(result, [
      {
        id: 9,
        nombre: 'nuevoModulo',
        label: 'nuevoModulo',
      },
    ]);
  }),
]);
