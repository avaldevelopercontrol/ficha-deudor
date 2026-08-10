import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  Modulo,
} from '../../../types/opcion.types';

import {
  validateEditarModuloForm,
  validateRegistrarModuloForm,
} from './registrarModulo.validation';

const root: Modulo = {
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
};

export const suite = defineSuite(
  'registrarModulo.validation',
  [
    test(
      'rechaza valores de icono que no pertenecen al catálogo',
      () => {
        const errors =
          validateRegistrarModuloForm(
            {
              applicationOptionCode:
                'mMantenerGrupo',
              nombre: 'Mantener Grupo',
              descripcion: '',
              codigo: 'mMantenerGrupo',
              icono: 'ruta-inventada.ico',
              padreId: 1,
              visible: true,
              estado: true,
            },
            {
              modulosExistentes: [root],
            }
          );

        assert.equal(
          errors.icono,
          'Seleccione un icono válido del catálogo SISGES.'
        );
      }
    ),
    test(
      'exige seleccionar una pantalla desarrollada al registrar',
      () => {
        const errors =
          validateRegistrarModuloForm(
            {
              applicationOptionCode:
                '',
              nombre: '',
              descripcion: '',
              codigo: '',
              icono: '',
              padreId: 1,
              visible: true,
              estado: true,
            },
            {
              modulosExistentes: [root],
            }
          );

        assert.equal(
          errors.applicationOptionCode,
          'Seleccione un módulo desarrollado válido.'
        );
      }
    ),
    test(
      'no exige ni valida orden al editar la opción Root',
      () => {
        const errors =
          validateEditarModuloForm(
            {
              nombre: 'Root',
              descripcion: '',
              codigo: 'Root',
              icono: '',
              padreId: 0,
              orden: 999,
              visible: true,
              estado: true,
            },
            {
              modulosExistentes: [root],
              moduloIdActual: 1,
            }
          );

        assert.equal(
          errors.orden,
          undefined
        );
        assert.deepEqual(errors, {});
      }
    ),
  ]
);
