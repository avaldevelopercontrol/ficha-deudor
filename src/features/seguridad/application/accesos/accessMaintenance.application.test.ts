import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import type {
  RegistrarUsuarioGrupoOpcionesData,
} from '../../domain/accesos/usuarioAccess.types';

import {
  ACCESS_USER_RULE_MESSAGES,
} from '../../domain/accesos/accessRuleMessages';

import {
  loadPerfilesConEstado,
  registrarAccesosUsuario,
  type AccessMaintenanceDependencies,
} from './accessMaintenance.application';

const USER_ACCESS_FORM: RegistrarUsuarioGrupoOpcionesData = {
  usuarioId: 10,
  grupoId: 20,
  assignments: [
    {
      opcionId: 30,
      permissions: {
        consultar: true,
        insertar: false,
        editar: false,
        eliminar: false,
        exportar: false,
      },
    },
  ],
};

const createDependencies = (): AccessMaintenanceDependencies => ({
  createPerfilOpciones: async () => {},
  fetchPerfilOptionsCount: async () => [],
  fetchPerfilesAcceso: async () => [],
  updatePerfilOpciones: async () => {},
  addUsuarioGrupoOpciones: async () => {},
  fetchUsuarioGrupoOpcionesByUsuarioGrupo:
    async () => [],
  fetchUsuarioGrupoOpcionesListado:
    async () => [],
  syncUsuarioGrupoOpciones: async () => {},
});

export const suite = defineSuite(
  'accessMaintenance.application',
  [
    test(
      'combina el conteo de opciones con el estado vigente del catálogo de perfiles',
      async () => {
        const dependencies = {
          ...createDependencies(),
          fetchPerfilOptionsCount: async () => [
            {
              idPerfil: 1,
              nombrePerfil: 'Administrador',
              cantidadOpciones: 12,
            },
            {
              idPerfil: 2,
              nombrePerfil: 'Consulta',
              cantidadOpciones: 4,
            },
          ],
          fetchPerfilesAcceso: async () => [
            {
              idPerfil: 1,
              nombrePerfil: 'Administrador',
              estadoActivo: true,
            },
            {
              idPerfil: 2,
              nombrePerfil: 'Consulta',
              estadoActivo: false,
            },
          ],
        } satisfies AccessMaintenanceDependencies;

        const result = await loadPerfilesConEstado(
          new AbortController().signal,
          dependencies
        );

        assert.deepEqual(
          result.map((perfil) => ({
            id: perfil.idPerfil,
            activo: perfil.estadoActivo,
          })),
          [
            { id: 1, activo: true },
            { id: 2, activo: false },
          ]
        );
      }
    ),
    test(
      'impide registrar por segunda vez la misma combinación usuario-grupo',
      async () => {
        let addCalls = 0;
        const dependencies = {
          ...createDependencies(),
          fetchUsuarioGrupoOpcionesByUsuarioGrupo:
            async () => [
              {
                idUsuarioGrupoOpcion: 1,
                idUsuario: 10,
                idGrupo: 20,
                idOpcion: 30,
                consultar: true,
                insertar: false,
                editar: false,
                eliminar: false,
                exportar: false,
                estadoActivo: true,
                crea: 7,
                fechaCrea:
                  '2026-09-01T10:00:00.000',
              },
            ],
          addUsuarioGrupoOpciones: async () => {
            addCalls += 1;
          },
        } satisfies AccessMaintenanceDependencies;

        await assert.rejects(
          () =>
            registrarAccesosUsuario(
              USER_ACCESS_FORM,
              '7',
              dependencies
            ),
          new RegExp(
            ACCESS_USER_RULE_MESSAGES
              .alreadyAssignedUserGroup
              .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          )
        );

        assert.equal(addCalls, 0);
      }
    ),
    test(
      'delega el alta cuando la combinación usuario-grupo todavía no tiene asignaciones',
      async () => {
        let receivedUserId = '';
        let receivedAssignmentCount = -1;

        const dependencies = {
          ...createDependencies(),
          addUsuarioGrupoOpciones: async (
            currentAssignments,
            form,
            authenticatedUserId
          ) => {
            assert.deepEqual(
              currentAssignments,
              []
            );
            assert.equal(form.usuarioId, 10);
            receivedUserId = authenticatedUserId;
            receivedAssignmentCount =
              form.assignments.length;
          },
        } satisfies AccessMaintenanceDependencies;

        await registrarAccesosUsuario(
          USER_ACCESS_FORM,
          '7',
          dependencies
        );

        assert.equal(receivedUserId, '7');
        assert.equal(receivedAssignmentCount, 1);
      }
    ),
  ]
);
