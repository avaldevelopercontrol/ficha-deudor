import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import type {
  RegistrarUsuarioGrupoOpcionesData,
  UsuarioGrupoOpcionAssignment,
} from '../modules/mantener-accesos-usuario/types/asignarAccesosUsuario.types';
import type {
  UsuarioGrupoOpcionDetalle,
} from '../types/usuarioGrupoOpcion.types';

import {
  buildCreateUsuarioGrupoOpcionRequests,
  buildUsuarioGrupoOpcionAddPlan,
  buildUsuarioGrupoOpcionSyncPlan,
} from './usuarioGrupoOpcionMutation.mapper';

const permissions = (
  overrides: Partial<UsuarioGrupoOpcionAssignment['permissions']> = {}
): UsuarioGrupoOpcionAssignment['permissions'] => ({
  consultar: true,
  insertar: false,
  editar: false,
  eliminar: false,
  exportar: false,
  ...overrides,
});

const assignment = (
  opcionId: number,
  overrides: Partial<UsuarioGrupoOpcionAssignment['permissions']> = {}
): UsuarioGrupoOpcionAssignment => ({
  opcionId,
  permissions: permissions(overrides),
});

const existing = (
  idUsuarioGrupoOpcion: number,
  idOpcion: number,
  overrides: Partial<UsuarioGrupoOpcionDetalle> = {}
): UsuarioGrupoOpcionDetalle => ({
  idUsuarioGrupoOpcion,
  idUsuario: 14931,
  idGrupo: 156,
  idOpcion,
  consultar: true,
  insertar: false,
  editar: false,
  eliminar: false,
  exportar: false,
  estadoActivo: true,
  crea: 100,
  fechaCrea: '2026-08-10T12:56:48.000',
  ...overrides,
});

const data = (
  assignments: UsuarioGrupoOpcionAssignment[]
): RegistrarUsuarioGrupoOpcionesData => ({
  usuarioId: 14931,
  grupoId: 156,
  assignments,
});

const fixedDate = new Date(
  '2026-08-11T15:30:00.123Z'
);

export const suite = defineSuite(
  'usuarioGrupoOpcionMutation.mapper',
  [
    test(
      'construye POST para opciones realmente nuevas con el usuario autenticado como creador',
      () => {
        const requests =
          buildCreateUsuarioGrupoOpcionRequests(
            data([
              assignment(10, {
                editar: true,
              }),
            ]),
            '777',
            fixedDate
          );

        assert.deepEqual(requests, [
          {
            nId_Usuario: 14931,
            nId_Grupo: 156,
            nId_Opcion: 10,
            bConsultar: true,
            bInsertar: false,
            bEditar: true,
            bEliminar: false,
            bExportar: false,
            bEstado: true,
            nCrea: 777,
            dFechaCrea:
              '2026-08-11T10:30:00.123',
          },
        ]);
      }
    ),
    test(
      'el alta incremental reactiva con PUT y no desactiva accesos existentes no seleccionados',
      () => {
        const plan =
          buildUsuarioGrupoOpcionAddPlan(
            [
              existing(1, 10),
              existing(2, 11, {
                estadoActivo: false,
              }),
            ],
            data([
              assignment(11, {
                insertar: true,
              }),
              assignment(12),
            ]),
            '777',
            fixedDate
          );

        assert.equal(
          plan.updateRequests.length,
          1
        );
        assert.deepEqual(
          plan.updateRequests[0],
          {
            nId_UsuarioGrupoOpcion: 2,
            nId_Usuario: 14931,
            nId_Grupo: 156,
            nId_Opcion: 11,
            bConsultar: true,
            bInsertar: true,
            bEditar: false,
            bEliminar: false,
            bExportar: false,
            bEstado: true,
            nCrea: 100,
            dFechaCrea:
              '2026-08-10T12:56:48.000',
            nModifica: 777,
            dFechaModifica:
              '2026-08-11T10:30:00.123',
          }
        );
        assert.deepEqual(
          plan.newAssignments.map(
            (item) => item.opcionId
          ),
          [12]
        );
      }
    ),
    test(
      'la edición desactiva con PUT lo que se quita, actualiza cambios y crea solo lo nuevo',
      () => {
        const plan =
          buildUsuarioGrupoOpcionSyncPlan(
            [
              existing(1, 10, {
                insertar: true,
              }),
              existing(2, 11),
              existing(3, 13, {
                estadoActivo: false,
              }),
            ],
            data([
              assignment(11, {
                editar: true,
              }),
              assignment(13),
              assignment(14),
            ]),
            '777',
            fixedDate
          );

        assert.deepEqual(
          plan.updateRequests.map(
            (request) => ({
              id: request.nId_UsuarioGrupoOpcion,
              optionId: request.nId_Opcion,
              estado: request.bEstado,
              consultar: request.bConsultar,
              insertar: request.bInsertar,
              editar: request.bEditar,
            })
          ),
          [
            {
              id: 1,
              optionId: 10,
              estado: false,
              consultar: true,
              insertar: true,
              editar: false,
            },
            {
              id: 2,
              optionId: 11,
              estado: true,
              consultar: true,
              insertar: false,
              editar: true,
            },
            {
              id: 3,
              optionId: 13,
              estado: true,
              consultar: true,
              insertar: false,
              editar: false,
            },
          ]
        );
        assert.deepEqual(
          plan.newAssignments.map(
            (item) => item.opcionId
          ),
          [14]
        );
      }
    ),
    test(
      'permite desactivar consultar cuando otro permiso permanece activo',
      () => {
        const plan =
          buildUsuarioGrupoOpcionSyncPlan(
            [
              existing(2, 10, {
                insertar: true,
                editar: true,
                eliminar: true,
                exportar: true,
              }),
            ],
            data([
              assignment(10, {
                consultar: false,
                insertar: true,
                editar: true,
                eliminar: true,
                exportar: true,
              }),
            ]),
            '777',
            fixedDate
          );

        assert.equal(
          plan.updateRequests[0]
            ?.bConsultar,
          false
        );
        assert.equal(
          plan.updateRequests[0]
            ?.bEstado,
          true
        );
      }
    ),
    test(
      'normaliza dFechaCrea del formato SQL antes de construir un PUT',
      () => {
        const plan =
          buildUsuarioGrupoOpcionSyncPlan(
            [
              existing(2, 11, {
                fechaCrea:
                  '2026-08-10 12:56:48',
              }),
            ],
            data([
              assignment(11, {
                editar: true,
              }),
            ]),
            '777',
            fixedDate
          );

        assert.equal(
          plan.updateRequests[0]
            ?.dFechaCrea,
          '2026-08-10T12:56:48.000'
        );
      }
    ),
    test(
      'no genera escrituras cuando una opción activa conserva los mismos permisos',
      () => {
        const plan =
          buildUsuarioGrupoOpcionSyncPlan(
            [existing(1, 10)],
            data([assignment(10)]),
            '777',
            fixedDate
          );

        assert.deepEqual(
          plan.updateRequests,
          []
        );
        assert.deepEqual(
          plan.newAssignments,
          []
        );
      }
    ),
    test(
      'rechaza duplicados para no crear dos relaciones Usuario Grupo Opción',
      () => {
        assert.throws(
          () =>
            buildUsuarioGrupoOpcionSyncPlan(
              [
                existing(1, 10),
                existing(2, 10),
              ],
              data([assignment(10)]),
              '777',
              fixedDate
            ),
          /duplicada para el usuario y grupo/i
        );
      }
    ),
  ]
);
