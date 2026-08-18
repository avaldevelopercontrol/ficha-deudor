import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  Modulo,
} from '../../../types/opcion.types';

import {
  resolveModuloImplementacion,
} from './moduloImplementation.utils';

const buildModulo = (
  overrides: Partial<Modulo> = {}
): Modulo => ({
  idModulo: 14,
  nombre: 'Cartera',
  descripcion: '',
  codigo: 'mCartera',
  ruta:
    'root/mGestionDeCobranzas/mCartera/',
  icono: '',
  tipo: 3,
  idPadre: 4,
  codigoPadre:
    'mGestionDeCobranzas',
  padre:
    'Gestión de cobranzas',
  orden: 2,
  visibleActivo: true,
  visible: 'Sí',
  estadoActivo: true,
  estado: 'Activo',
  ...overrides,
});

export const suite = defineSuite(
  'estado de implementación de módulos',
  [
    test(
      'identifica una pantalla React por nId_Opcion',
      () => {
        const modulo =
          buildModulo({
            idModulo: 20,
          });

        assert.equal(
          resolveModuloImplementacion(
            modulo,
            [modulo]
          ),
          'IMPLEMENTADA'
        );
      }
    ),
    test(
      'identifica estructuras por raíz o por tener hijos',
      () => {
        const padre =
          buildModulo({
            idModulo: 24,
            tipo: 2,
          });

        const hijo =
          buildModulo({
            idModulo: 23,
            idPadre: 24,
          });

        assert.equal(
          resolveModuloImplementacion(
            padre,
            [padre, hijo]
          ),
          'ESTRUCTURA'
        );

        const root =
          buildModulo({
            idModulo: 1,
            tipo: 1,
            idPadre: 0,
          });

        assert.equal(
          resolveModuloImplementacion(
            root,
            [root]
          ),
          'ESTRUCTURA'
        );
      }
    ),
    test(
      'identifica un módulo sin pantalla ni hijos',
      () => {
        const modulo =
          buildModulo();

        assert.equal(
          resolveModuloImplementacion(
            modulo,
            [modulo]
          ),
          'SIN PANTALLA'
        );
      }
    ),
  ]
);
