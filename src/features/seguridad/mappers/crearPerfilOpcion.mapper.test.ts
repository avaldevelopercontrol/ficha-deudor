import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  buildCreatePerfilOpcionRequests,
} from './crearPerfilOpcion.mapper';

const data = {
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
      opcionId: 7,
      permissions: {
        consultar: true,
        insertar: true,
        editar: false,
        eliminar: false,
        exportar: true,
      },
    },
  ],
};

export const suite = defineSuite(
  'crearPerfilOpcion.mapper',
  [
    test(
      'construye un request por cada opción con usuario y fecha comunes',
      () => {
        const requests =
          buildCreatePerfilOpcionRequests(
            data,
            '16068',
            new Date(
              '2026-08-04T19:40:20.118Z'
            )
          );

        assert.equal(
          requests.length,
          2
        );
        assert.deepEqual(
          requests[0],
          {
            nId_Perfil: 9,
            nId_Opcion: 6,
            bConsultar: true,
            bInsertar: false,
            bEditar: true,
            bEliminar: false,
            bExportar: false,
            bEstado: true,
            nCrea: 16068,
            dFechaCrea:
              '2026-08-04T14:40:20.118',
          }
        );
        assert.equal(
          requests[1]?.dFechaCrea,
          requests[0]?.dFechaCrea
        );
      }
    ),
    test(
      'rechaza identificadores inválidos opciones duplicadas y permisos vacíos',
      () => {
        assert.throws(
          () =>
            buildCreatePerfilOpcionRequests(
              {
                ...data,
                perfilId: 0,
              },
              '16068'
            ),
          /nId_Perfil/
        );

        assert.throws(
          () =>
            buildCreatePerfilOpcionRequests(
              {
                perfilId: 9,
                assignments: [
                  data.assignments[0]!,
                  data.assignments[0]!,
                ],
              },
              '16068'
            ),
          /duplicada/
        );

        assert.throws(
          () =>
            buildCreatePerfilOpcionRequests(
              {
                perfilId: 9,
                assignments: [
                  {
                    opcionId: 6,
                    permissions: {
                      consultar: false,
                      insertar: false,
                      editar: false,
                      eliminar: false,
                      exportar: false,
                    },
                  },
                ],
              },
              '16068'
            ),
          /por lo menos un permiso/
        );
      }
    ),
  ]
);
