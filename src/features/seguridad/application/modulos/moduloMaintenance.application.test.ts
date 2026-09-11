import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import type {
  EditarModuloFormData,
  RegistrarModuloFormData,
} from '../../domain/modulos/moduloForm.types';
import type {
  OpcionApi,
} from '../../types/opcion.types';

import {
  ModuloAnalyticsSyncError,
  actualizarModulo,
  registrarModulo,
  type ModuloMaintenanceDependencies,
} from './moduloMaintenance.application';

const REGISTER_FORM: RegistrarModuloFormData = {
  nombre: 'Reporte',
  descripcion: 'Reporte Power BI',
  codigo: 'reporte',
  icono: 'chart',
  esPowerBI: true,
  urlBI: 'https://app.powerbi.com/report',
  imagenOpcion: '',
  emailOpcion: 'reportes@example.com',
  padreId: 10,
  visible: true,
  estado: true,
};

const EDIT_FORM: EditarModuloFormData = {
  ...REGISTER_FORM,
  orden: 2,
};

const MODULO_DETALLE: OpcionApi = {
  nId_Opcion: 22,
  sCodigoOpcion: 'reporte',
  sNombreOpcion: 'Reporte',
  sDescripcionOpcion: 'Reporte Power BI',
  sUrlOpcion: '/reporte/',
  sUrlBI: 'https://app.powerbi.com/report',
  sIcono: 'chart',
  sImagenOpcion: null,
  sEmailOpcion: 'reportes@example.com',
  nTipo: 3,
  nId_OpcionPadre: 10,
  nOrden: 2,
  bVisible: true,
  bEstado: true,
  nCrea: 1,
  dFechaCrea: '2026-09-01T10:00:00.000',
  nModifica: 1,
  dFechaModifica: null,
};

const createDependencies = (
  calls: string[]
): ModuloMaintenanceDependencies => ({
  createOpcion: async () => {
    calls.push('create');

    return {
      nId_Opcion: 22,
      sCodigoOpcion: 'reporte',
      sNombreOpcion: 'Reporte',
      nId_OpcionPadre: 10,
    };
  },
  updateOpcion: async () => {
    calls.push('update');
    return null;
  },
  syncAnalyticsOption: async () => {
    calls.push('sync-create');
  },
  syncAnalyticsPowerBiConfiguration:
    async () => {
      calls.push('sync-update');
    },
});

export const suite = defineSuite(
  'moduloMaintenance.application',
  [
    test(
      'registra primero en SISGES y después sincroniza Analytics cuando el módulo es Power BI',
      async () => {
        const calls: string[] = [];
        const dependencies =
          createDependencies(calls);

        await registrarModulo(
          {
            form: REGISTER_FORM,
            modulos: [],
            authenticatedUserId: '7',
            groupIds: [3, 5],
          },
          dependencies
        );

        assert.deepEqual(calls, [
          'create',
          'sync-create',
        ]);
      }
    ),
    test(
      'no invoca Analytics al registrar un módulo que no es Power BI',
      async () => {
        const calls: string[] = [];
        const dependencies =
          createDependencies(calls);

        await registrarModulo(
          {
            form: {
              ...REGISTER_FORM,
              esPowerBI: false,
            },
            modulos: [],
            authenticatedUserId: '7',
          },
          dependencies
        );

        assert.deepEqual(calls, ['create']);
      }
    ),
    test(
      'distingue un fallo de Analytics después de persistir correctamente en SISGES',
      async () => {
        const calls: string[] = [];
        const dependencies = {
          ...createDependencies(calls),
          syncAnalyticsOption: async () => {
            calls.push('sync-create');
            throw new Error(
              'Analytics no disponible'
            );
          },
        } satisfies ModuloMaintenanceDependencies;

        await assert.rejects(
          () =>
            registrarModulo(
              {
                form: REGISTER_FORM,
                modulos: [],
                authenticatedUserId: '7',
              },
              dependencies
            ),
          (error: unknown) => {
            assert.ok(
              error instanceof
                ModuloAnalyticsSyncError
            );
            assert.match(
              error.message,
              /Analytics no disponible/
            );
            assert.equal(
              error.hasPersistedSisgesChanges,
              true
            );
            return true;
          }
        );

        assert.deepEqual(calls, [
          'create',
          'sync-create',
        ]);
      }
    ),
    test(
      'actualiza SISGES antes de sincronizar la configuración completa de Power BI',
      async () => {
        const calls: string[] = [];
        const dependencies =
          createDependencies(calls);

        await actualizarModulo(
          {
            moduloDetalle: MODULO_DETALLE,
            form: EDIT_FORM,
            modulos: [],
            authenticatedUserId: '7',
            groupIds: [3],
            reportClientPublications: [],
          },
          dependencies
        );

        assert.deepEqual(calls, [
          'update',
          'sync-update',
        ]);
      }
    ),
  ]
);
