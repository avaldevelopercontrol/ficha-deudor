import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  EditarUsuarioFormData,
  UsuarioGrupoItem,
} from '../types/editarUsuario.types';

import {
  hasEditarUsuarioDataChanges,
  normalizeEditarUsuarioForm,
  validateEditarUsuarioForm,
} from './editarUsuario.validation';

const createValidForm = (): EditarUsuarioFormData => ({
  dni: '76139068',
  nombre: 'Junior Abraham',
  apellidoPaterno: 'Perez',
  apellidoMaterno: 'Huamani',
  usuario: '16068',
  contrasenaActual: 'ClaveActual123!',
  cambiarContrasena: false,
  contrasenaNueva: '',
  perfil: '9',
  estado: true,
  fechaNacimiento: '2003-07-26',
  sexo: 1,
  departamentoLabor: '1379',
  ciudadGestor: 'Lima',
  subZonalOficina: '26',
  movilEmpresa: '987654321',
  anexo: '1234',
  emailEmpresa: 'empresa@correo.com',
  emailPersonal: 'personal@correo.com',
  campanaDiscador: '7',
});

const assignedGroup: UsuarioGrupoItem = {
  idUsuarioGrupo: 9901,
  idUsuario: 16068,
  idGrupo: 219,
  nombre: 'ADEX INSTITUTO',
};

export const suite = defineSuite(
  'editarUsuario.validation',
  [
    test(
      'no exige ninguna contraseña cuando el cambio está desmarcado',
      () => {
        const errors =
          validateEditarUsuarioForm(
            {
              ...createValidForm(),
              contrasenaActual: '',
            },
            {
              gruposActuales: [
                assignedGroup,
              ],
            }
          );

        assert.equal(
          errors.contrasenaNueva,
          undefined
        );
        assert.deepEqual(errors, {});
      }
    ),

    test(
      'exige la contraseña actual solamente cuando se solicita el cambio',
      () => {
        const errors =
          validateEditarUsuarioForm(
            {
              ...createValidForm(),
              cambiarContrasena: true,
              contrasenaActual: '',
              contrasenaNueva:
                'NuevaClave123!',
            },
            {
              gruposActuales: [
                assignedGroup,
              ],
            }
          );

        assert.equal(
          errors.contrasenaActual,
          'La contraseña actual es obligatoria.'
        );
      }
    ),

    test(
      'aplica los mismos requisitos de contraseña de Agregar usuario cuando se solicita el cambio',
      () => {
        const form = {
          ...createValidForm(),
          cambiarContrasena: true,
          contrasenaNueva: 'simple',
        };

        const errors =
          validateEditarUsuarioForm(
            form,
            {
              gruposActuales: [
                assignedGroup,
              ],
            }
          );

        assert.match(
          errors.contrasenaNueva ?? '',
          /entre 8 y 20 caracteres/i
        );
      }
    ),

    test(
      'exige conservar al menos un grupo asignado',
      () => {
        const errors =
          validateEditarUsuarioForm(
            createValidForm(),
            {
              gruposActuales: [],
            }
          );

        assert.match(
          errors.grupos ?? '',
          /al menos un grupo/i
        );
      }
    ),

    test(
      'no considera modificado al usuario cuando solo cambian sus grupos',
      () => {
        const initial =
          normalizeEditarUsuarioForm(
            createValidForm()
          );

        const current = {
          ...initial,
        };

        assert.equal(
          hasEditarUsuarioDataChanges(
            current,
            initial
          ),
          false
        );
      }
    ),

    test(
      'detecta cambios de datos o de contraseña para decidir el PUT de Usuario',
      () => {
        const initial =
          normalizeEditarUsuarioForm(
            createValidForm()
          );

        assert.equal(
          hasEditarUsuarioDataChanges(
            {
              ...initial,
              anexo: '9999',
            },
            initial
          ),
          true
        );

        assert.equal(
          hasEditarUsuarioDataChanges(
            {
              ...initial,
              cambiarContrasena: true,
              contrasenaActual:
                'ClaveActual123!',
              contrasenaNueva:
                'NuevaClave123!',
            },
            initial
          ),
          true
        );
      }
    ),

  ]
);
