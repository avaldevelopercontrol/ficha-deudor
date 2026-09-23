import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import type {
  Modulo,
} from '../../types/opcion.types';

import {
  asPowerBiEditarModuloForm,
  asPowerBiRegistrarModuloForm,
  buildRegistrarModuloInitialForm,
  buildRegistrarPowerBiInitialForm,
  suggestModuloCode,
} from './moduloForm.utils';

import {
  POWER_BI_DEFAULT_ICON,
  POWER_BI_PARENT_OPTION_ID,
} from './powerBiModulo.utils';

const buildModulo = (
  overrides: Partial<Modulo>
): Modulo => ({
  idModulo: 1,
  nombre: 'Root',
  descripcion: '',
  codigo: 'Root',
  ruta: 'root/',
  urlBI: null,
  imagenOpcion: null,
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
  'moduloForm.utils',
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
            esPowerBI: false,
            urlBI: '',
            imagenOpcion: '',
            emailOpcion: '',
            padreId: 1,
            visible: true,
            estado: true,
          }
        );
      }
    ),
    test(
      'inicia el alta especializada de BI con sus invariantes técnicas',
      () => {
        const form =
          buildRegistrarPowerBiInitialForm([
            buildModulo({}),
            buildModulo({
              idModulo:
                POWER_BI_PARENT_OPTION_ID,
              nombre: 'Reportería',
              codigo: 'mReporteria',
              tipo: 3,
              idPadre: 1,
            }),
          ]);

        assert.equal(
          form.esPowerBI,
          true
        );
        assert.equal(
          form.padreId,
          POWER_BI_PARENT_OPTION_ID
        );
        assert.equal(
          form.icono,
          POWER_BI_DEFAULT_ICON
        );
      }
    ),
    test(
      'restaura las invariantes BI antes de enviar aunque el estado recibido sea inconsistente',
      () => {
        const form =
          asPowerBiRegistrarModuloForm({
            nombre: 'Cartera BI',
            descripcion: '',
            codigo: 'mCarteraBi',
            icono: 'shield',
            esPowerBI: false,
            urlBI: 'https://app.powerbi.com/view?r=demo',
            imagenOpcion: '',
            emailOpcion: 'bi@empresa.com',
            padreId: 1,
            visible: true,
            estado: true,
          });

        assert.equal(
          form.esPowerBI,
          true
        );
        assert.equal(
          form.padreId,
          POWER_BI_PARENT_OPTION_ID
        );
        assert.equal(
          form.icono,
          POWER_BI_DEFAULT_ICON
        );
      }
    ),
    test(
      'restaura las invariantes BI antes de actualizar desde Mantener BI',
      () => {
        const form =
          asPowerBiEditarModuloForm({
            nombre: 'GESTION INTEGRAL DE COBRANZA - SUPERVISOR',
            descripcion: '',
            codigo: 'mGestionIntegralSupervisor',
            icono: 'shield',
            esPowerBI: false,
            urlBI: 'https://app.powerbi.com/view?r=demo',
            imagenOpcion: '',
            emailOpcion: 'bi@empresa.com',
            padreId: 2,
            orden: 4,
            visible: true,
            estado: true,
          });

        assert.equal(
          form.esPowerBI,
          true
        );
        assert.equal(
          form.padreId,
          POWER_BI_PARENT_OPTION_ID
        );
        assert.equal(
          form.icono,
          POWER_BI_DEFAULT_ICON
        );
        assert.equal(
          form.orden,
          4
        );
      }
    ),
  ]
);
