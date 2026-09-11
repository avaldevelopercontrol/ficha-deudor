import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import type {
  ModuloMutationState,
} from './moduloMutation.types';
import {
  cascadeModuloHierarchyValues,
  renumberModuloParentChildren,
  resolveModuloRouteSegment,
} from './moduloHierarchy.utils';

const createState = (
  overrides: Partial<ModuloMutationState>
): ModuloMutationState => ({
  idModulo: 1,
  codigo: 'Root',
  nombre: 'Root',
  descripcion: '',
  ruta: 'root/',
  urlBI: null,
  imagenOpcion: null,
  emailOpcion: null,
  icono: '',
  tipo: 1,
  idPadre: 0,
  orden: 0,
  visible: true,
  estado: true,
  ...overrides,
});

export const suite = defineSuite(
  'moduloHierarchy.utils',
  [
    test(
      'preserva el último segmento configurado de una ruta',
      () => {
        assert.equal(
          resolveModuloRouteSegment(
            'root/mPortfolio-control-center/',
            'mPortfolioControlCenter'
          ),
          'mPortfolio-control-center'
        );
      }
    ),
    test(
      'renumera hermanos al insertar el módulo actual en la posición solicitada',
      () => {
        const modules = new Map<
          number,
          ModuloMutationState
        >([
          [
            10,
            createState({
              idModulo: 10,
              codigo: 'Padre',
              tipo: 2,
            }),
          ],
          [
            11,
            createState({
              idModulo: 11,
              idPadre: 10,
              orden: 1,
              tipo: 3,
            }),
          ],
          [
            12,
            createState({
              idModulo: 12,
              idPadre: 10,
              orden: 2,
              tipo: 3,
            }),
          ],
          [
            13,
            createState({
              idModulo: 13,
              idPadre: 10,
              orden: 3,
              tipo: 3,
            }),
          ],
        ]);

        renumberModuloParentChildren(
          modules,
          10,
          13,
          1
        );

        assert.equal(modules.get(13)?.orden, 1);
        assert.equal(modules.get(11)?.orden, 2);
        assert.equal(modules.get(12)?.orden, 3);
      }
    ),
    test(
      'propaga ruta y nivel a todos los descendientes del módulo actualizado',
      () => {
        const modules = new Map<
          number,
          ModuloMutationState
        >([
          [
            10,
            createState({
              idModulo: 10,
              codigo: 'mPadreNuevo',
              ruta: 'root/mPadreNuevo/',
              tipo: 2,
            }),
          ],
          [
            11,
            createState({
              idModulo: 11,
              codigo: 'mHijo',
              ruta: 'root/mPadreAnterior/mHijo/',
              idPadre: 10,
              tipo: 3,
              orden: 1,
            }),
          ],
          [
            12,
            createState({
              idModulo: 12,
              codigo: 'mNieto',
              ruta: 'root/mPadreAnterior/mHijo/mNieto/',
              idPadre: 11,
              tipo: 4,
              orden: 1,
            }),
          ],
        ]);

        cascadeModuloHierarchyValues(
          modules,
          10
        );

        assert.equal(
          modules.get(11)?.ruta,
          'root/mPadreNuevo/mHijo/'
        );
        assert.equal(modules.get(11)?.tipo, 3);
        assert.equal(
          modules.get(12)?.ruta,
          'root/mPadreNuevo/mHijo/mNieto/'
        );
        assert.equal(modules.get(12)?.tipo, 4);
      }
    ),
  ]
);
