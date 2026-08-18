import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  Modulo,
} from '../../../types/opcion.types';

import {
  buildRegistrarModuloInitialForm,
  suggestModuloCode,
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

export const suite = defineSuite(
  'registrarModulo.utils',
  [
    test(
      'sugiere el código manual con el patrón m + nombre en PascalCase',
      () => {
        assert.equal(
          suggestModuloCode(
            'Mantener accesos por perfil'
          ),
          'mMantenerAccesosPorPerfil'
        );
        assert.equal(
          suggestModuloCode(
            'Gestión de cobranzas'
          ),
          'mGestionDeCobranzas'
        );
        assert.equal(
          suggestModuloCode(
            'Portfolio Control Center'
          ),
          'mPortfolioControlCenter'
        );
      }
    ),
    test(
      'inicia el registro sobre Root sin depender de una pantalla React previa',
      () => {
        const form =
          buildRegistrarModuloInitialForm([
            buildModulo({}),
          ]);

        assert.deepEqual(
          form,
          {
            nombre: '',
            descripcion: '',
            codigo: '',
            icono: '',
            padreId: 1,
            visible: true,
            estado: true,
          }
        );
      }
    ),
  ]
);
