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
  urlBI: null,
  imagenOpcion: null,
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
      'identifica un módulo implementado por nId_Opcion',
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
          'IMPLEMENTADO'
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
          'AGRUPADOR'
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
          'AGRUPADOR'
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
          'SIN IMPLEMENTAR'
        );
      }
    ),
    test(
      'identifica un tablero configurado mediante sUrlBI',
      () => {
        const modulo = buildModulo({
          idModulo: 26,
          urlBI: 'https://app.powerbi.com/view?r=demo',
          imagenOpcion: '/logos/backus.webp',
        });

        assert.equal(
          resolveModuloImplementacion(modulo, [modulo]),
          'POWER BI'
        );
      }
    ),
  ]
);
