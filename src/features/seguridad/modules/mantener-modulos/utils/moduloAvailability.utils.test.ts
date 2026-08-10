import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  Modulo,
} from '../../../types/opcion.types';

import {
  getModuloDescendants,
  normalizeModuloAvailability,
  validateModuloAvailabilityTransition,
} from './moduloAvailability.utils';

const createModule = (
  overrides: Partial<Modulo>
): Modulo => ({
  idModulo: 1,
  nombre: 'Root',
  descripcion: '',
  codigo: 'Root',
  ruta: 'root/',
  icono: '',
  tipo: 1,
  idPadre: 0,
  codigoPadre: '',
  padre: '',
  orden: 0,
  visibleActivo: true,
  visible: 'Sí',
  estadoActivo: true,
  estado: 'Activo',
  ...overrides,
});

const modules: Modulo[] = [
  createModule({
    idModulo: 1,
  }),
  createModule({
    idModulo: 2,
    nombre: 'Seguridad',
    codigo: 'mSeguridad',
    idPadre: 1,
    tipo: 2,
    orden: 1,
  }),
  createModule({
    idModulo: 6,
    nombre: 'Mantener perfil',
    codigo: 'mMantenerPerfil',
    idPadre: 2,
    tipo: 3,
    orden: 1,
  }),
  createModule({
    idModulo: 7,
    nombre: 'Mantener módulo',
    codigo: 'mMantenerModulo',
    idPadre: 2,
    tipo: 3,
    orden: 2,
  }),
];

export const suite = defineSuite(
  'moduloAvailability.utils',
  [
    test(
      'fuerza visible en no cuando el estado pasa a inactivo',
      () => {
        assert.deepEqual(
          normalizeModuloAvailability({
            estado: false,
            visible: true,
          }),
          {
            estado: false,
            visible: false,
          }
        );

        assert.deepEqual(
          normalizeModuloAvailability({
            estado: true,
            visible: false,
          }),
          {
            estado: true,
            visible: false,
          }
        );
      }
    ),
    test(
      'obtiene hijos y descendientes sin incluir al módulo actual',
      () => {
        assert.deepEqual(
          getModuloDescendants(
            1,
            modules
          ).map(
            (module) =>
              module.idModulo
          ),
          [
            2,
            6,
            7,
          ]
        );
      }
    ),
    test(
      'impide inactivar u ocultar un padre mientras existan descendientes activos o visibles',
      () => {
        const errors =
          validateModuloAvailabilityTransition(
            {
              estado: false,
              visible: false,
            },
            2,
            modules
          );

        assert.match(
          errors.estado ?? '',
          /primero inactive/i
        );
        assert.match(
          errors.estado ?? '',
          /Mantener perfil/
        );
        assert.match(
          errors.visible ?? '',
          /primero oculte/i
        );
      }
    ),
    test(
      'permite inactivar y ocultar al padre después de actualizar todos sus descendientes',
      () => {
        const safeModules =
          modules.map(
            (module) =>
              module.idPadre === 2
                ? {
                    ...module,
                    estadoActivo: false,
                    estado: 'Inactivo' as const,
                    visibleActivo: false,
                    visible: 'No' as const,
                  }
                : module
          );

        assert.deepEqual(
          validateModuloAvailabilityTransition(
            {
              estado: false,
              visible: false,
            },
            2,
            safeModules
          ),
          {}
        );
      }
    ),
  ]
);
