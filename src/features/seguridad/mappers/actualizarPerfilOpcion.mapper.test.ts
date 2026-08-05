import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  buildPerfilOpcionUpdatePlan,
} from './actualizarPerfilOpcion.mapper';

export const suite = defineSuite(
  'actualizarPerfilOpcion.mapper',
  [
    test(
      'genera PUT solo para cambios y separa las asignaciones nuevas',
      () => {
        const plan =
          buildPerfilOpcionUpdatePlan(
            [
              {
                idPerfilOpcion: 20,
                idPerfil: 9,
                idOpcion: 6,
                consultar: true,
                insertar: false,
                editar: false,
                eliminar: false,
                exportar: false,
                estadoActivo: true,
              },
              {
                idPerfilOpcion: 21,
                idPerfil: 9,
                idOpcion: 7,
                consultar: true,
                insertar: false,
                editar: false,
                eliminar: false,
                exportar: false,
                estadoActivo: true,
              },
            ],
            {
              perfilId: 9,
              assignments: [
                {
                  opcionId: 6,
                  permissions: {
                    consultar: true,
                    insertar: false,
                    editar: true,
                    eliminar: false,
                    exportar: false,
                  },
                },
                {
                  opcionId: 8,
                  permissions: {
                    consultar: true,
                    insertar: false,
                    editar: false,
                    eliminar: false,
                    exportar: true,
                  },
                },
              ],
            },
            '16068',
            new Date(
              '2026-08-05T14:29:51.095Z'
            )
          );

        assert.deepEqual(
          plan.updateRequests,
          [
            {
              nId_PerfilOpcion: 20,
              nId_Perfil: 9,
              nId_Opcion: 6,
              bConsultar: true,
              bInsertar: false,
              bEditar: true,
              bEliminar: false,
              bExportar: false,
              bEstado: true,
              nModifica: 16068,
              dFechaModifica:
                '2026-08-05T09:29:51.095',
            },
            {
              nId_PerfilOpcion: 21,
              nId_Perfil: 9,
              nId_Opcion: 7,
              bConsultar: false,
              bInsertar: false,
              bEditar: false,
              bEliminar: false,
              bExportar: false,
              bEstado: false,
              nModifica: 16068,
              dFechaModifica:
                '2026-08-05T09:29:51.095',
            },
          ]
        );

        assert.deepEqual(
          plan.newAssignments,
          [
            {
              opcionId: 8,
              permissions: {
                consultar: true,
                insertar: false,
                editar: false,
                eliminar: false,
                exportar: true,
              },
            },
          ]
        );
      }
    ),
    test(
      'omite relaciones existentes que no cambiaron',
      () => {
        const plan =
          buildPerfilOpcionUpdatePlan(
            [
              {
                idPerfilOpcion: 20,
                idPerfil: 9,
                idOpcion: 6,
                consultar: true,
                insertar: false,
                editar: false,
                eliminar: false,
                exportar: false,
                estadoActivo: true,
              },
            ],
            {
              perfilId: 9,
              assignments: [
                {
                  opcionId: 6,
                  permissions: {
                    consultar: true,
                    insertar: false,
                    editar: false,
                    eliminar: false,
                    exportar: false,
                  },
                },
              ],
            },
            '16068'
          );

        assert.deepEqual(
          plan,
          {
            updateRequests: [],
            newAssignments: [],
          }
        );
      }
    ),
  ]
);
