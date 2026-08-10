import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  Modulo,
} from '../../../types/opcion.types';

import {
  applyApplicationOptionToForm,
  buildRegistrarModuloInitialForm,
  getAvailableApplicationOptions,
} from './registrarModulo.utils';

const buildModulo = (
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

const root = buildModulo({});

const seguridad = buildModulo({
  idModulo: 20,
  nombre: 'Seguridad',
  codigo: 'mSeguridad',
  ruta: 'root/mSeguridad/',
  tipo: 2,
  idPadre: 1,
  orden: 1,
});

export const suite = defineSuite(
  'registrarModulo.utils',
  [
    test(
      'muestra solo pantallas desarrolladas que aún no están registradas',
      () => {
        const mantenerPerfil =
          buildModulo({
            idModulo: 21,
            nombre:
              'Mantener Perfil',
            codigo:
              'mMantenerPerfil',
            idPadre: 20,
          });

        const available =
          getAvailableApplicationOptions([
            root,
            seguridad,
            mantenerPerfil,
          ]);

        assert.equal(
          available.some(
            (option) =>
              option.code ===
              'mMantenerPerfil'
          ),
          false
        );
        assert.equal(
          available.some(
            (option) =>
              option.code ===
              'mMantenerGrupo'
          ),
          true
        );
      }
    ),
    test(
      'autocompleta Mantener Grupo y selecciona Seguridad como padre',
      () => {
        const initialForm =
          buildRegistrarModuloInitialForm([
            root,
            seguridad,
          ]);

        const definition =
          getAvailableApplicationOptions([
            root,
            seguridad,
          ]).find(
            (option) =>
              option.code ===
              'mMantenerGrupo'
          );

        assert.ok(definition);

        const form =
          applyApplicationOptionToForm(
            initialForm,
            definition,
            [root, seguridad]
          );

        assert.equal(
          form.applicationOptionCode,
          'mMantenerGrupo'
        );
        assert.equal(
          form.nombre,
          'Mantener Grupo'
        );
        assert.equal(
          form.codigo,
          'mMantenerGrupo'
        );
        assert.equal(
          form.padreId,
          20
        );
      }
    ),
  ]
);
