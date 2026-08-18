import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  buildUpdateUsuarioRequest,
  getEditarUsuarioOriginalValues,
  getUsuarioGrupoDiff,
  getUsuarioUpdateMismatches,
  mapUsuarioDetalleToEditarForm,
  mapUsuarioGrupoAsignado,
} from './editarUsuario.mapper';

import type {
  EditarUsuarioFormData,
  UsuarioGrupoItem,
} from '../modules/mantener-usuario/types/editarUsuario.types';

import type {
  UsuarioDetalleApi,
} from '../types/editarUsuario.types';

const createUsuarioDetalle = (): UsuarioDetalleApi => ({
  nId_Usuario: 16068,
  cUsr_NroDoc: '76139068',
  cUsr_ApePat: 'PEREZ',
  cUsr_ApeMat: 'HUAMANI',
  cUsr_Nombres: 'JUNIOR ABRAHAM',
  bSexo: 1,
  cUsr_Login: '16068',
  cUsr_Pass: 'hash-no-editable',
  bEstado: true,
  dUsr_FecNac: '2003-07-26T00:00:00',
  nId_Ubigeo: 1379,
  nId_Grupo: 246,
  nid_perfil: 9,
  cod_Recau: 'REC-01',
  nUsr_CiuGestor: 'LIMA',
  nId_SubZonaGen: 26,
  cUsr_Celular: '987654321',
  cUsr_Anexo: '1234',
  cUsr_Email: 'EMPRESA@MAIL.COM',
  cUsr_EmailPersonal: 'PERSONAL@MAIL.COM',
  nroCampanaDiscador: 7,
});

const createEditarForm = (): EditarUsuarioFormData => ({
  dni: '76139069',
  nombre: 'Junior Abraham',
  apellidoPaterno: 'Perez',
  apellidoMaterno: 'Huamani',
  usuario: '16069',
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
  anexo: '5678',
  emailEmpresa: 'NUEVO@EMPRESA.COM',
  emailPersonal: 'NUEVO@PERSONAL.COM',
  campanaDiscador: '7',
});

const createGroup = (
  idGrupo: number,
  idUsuarioGrupo: number | null
): UsuarioGrupoItem => ({
  idUsuarioGrupo,
  idUsuario: 16068,
  idGrupo,
  nombre: `Grupo ${idGrupo}`,
});

export const suite = defineSuite(
  'editarUsuario.mapper',
  [
    test(
      'precarga el formulario sin exponer el hash de contraseña',
      () => {
        const form =
          mapUsuarioDetalleToEditarForm(
            createUsuarioDetalle()
          );

        assert.equal(form.usuario, '16068');
        assert.equal(
          form.contrasenaActual,
          ''
        );
        assert.equal(
          form.contrasenaNueva,
          ''
        );
        assert.equal(
          form.cambiarContrasena,
          false
        );
        assert.equal(
          form.fechaNacimiento,
          '2003-07-26'
        );
      }
    ),

    test(
      'conserva cUsr_Pass del GET en ambos campos cuando bCambioPass es false',
      () => {
        const usuario =
          createUsuarioDetalle();

        const request =
          buildUpdateUsuarioRequest(
            createEditarForm(),
            getEditarUsuarioOriginalValues(
              usuario
            )
          );

        assert.equal(
          request.bCambioPass,
          false
        );
        assert.equal(
          request.cUsr_Pass,
          'hash-no-editable'
        );
        assert.equal(
          request.cUsr_PassNew,
          'hash-no-editable'
        );
        assert.equal(
          request.nId_Grupo,
          usuario.nId_Grupo
        );
        assert.equal(
          request.cod_Recau,
          usuario.cod_Recau
        );
      }
    ),

    test(
      'envía la nueva contraseña solamente cuando el checkbox está activo',
      () => {
        const usuario =
          createUsuarioDetalle();
        const form = {
          ...createEditarForm(),
          cambiarContrasena: true,
          contrasenaNueva: 'NuevaClave123!',
        };

        const request =
          buildUpdateUsuarioRequest(
            form,
            getEditarUsuarioOriginalValues(
              usuario
            )
          );

        assert.equal(
          request.bCambioPass,
          true
        );
        assert.equal(
          request.cUsr_Pass,
          'ClaveActual123!'
        );
        assert.equal(
          request.cUsr_PassNew,
          'NuevaClave123!'
        );
      }
    ),

    test(
      'usa la contraseña escrita por el operador solo cuando se solicita cambiarla',
      () => {
        const usuario =
          createUsuarioDetalle();
        const form = {
          ...createEditarForm(),
          cambiarContrasena: true,
          contrasenaActual: 'ClaveActual123!',
          contrasenaNueva: 'NuevaClave123!',
        };

        const request =
          buildUpdateUsuarioRequest(
            form,
            getEditarUsuarioOriginalValues(
              usuario
            )
          );

        assert.equal(
          request.cUsr_Pass,
          'ClaveActual123!'
        );
        assert.equal(
          request.cUsr_PassNew,
          'NuevaClave123!'
        );
      }
    ),

    test(
      'detecta cuando el GET posterior al PUT no refleja los datos enviados',
      () => {
        const form =
          createEditarForm();
        const persisted = {
          ...createUsuarioDetalle(),
          cUsr_NroDoc: form.dni,
          cUsr_ApePat:
            form.apellidoPaterno,
          cUsr_ApeMat:
            form.apellidoMaterno,
          cUsr_Nombres: form.nombre,
          cUsr_Login: form.usuario,
          nid_perfil: Number(form.perfil),
          bEstado: form.estado,
          dUsr_FecNac:
            `${form.fechaNacimiento}T00:00:00`,
          bSexo: Number(form.sexo),
          nId_Ubigeo: Number(
            form.departamentoLabor
          ),
          nUsr_CiuGestor:
            form.ciudadGestor,
          nId_SubZonaGen: Number(
            form.subZonalOficina
          ),
          cUsr_Celular:
            form.movilEmpresa,
          cUsr_Anexo: form.anexo,
          cUsr_Email:
            form.emailEmpresa,
          cUsr_EmailPersonal:
            form.emailPersonal,
          nroCampanaDiscador: Number(
            form.campanaDiscador
          ),
        };

        assert.deepEqual(
          getUsuarioUpdateMismatches(
            form,
            persisted
          ),
          []
        );

        assert.deepEqual(
          getUsuarioUpdateMismatches(
            form,
            {
              ...persisted,
              cUsr_Anexo: '9999',
              cUsr_Email:
                'otro@correo.com',
            }
          ),
          ['anexo', 'email empresa']
        );
      }
    ),

    test(
      'distingue nId_UGrupo de nId_Grupo al mapear una asignación existente',
      () => {
        const group =
          mapUsuarioGrupoAsignado({
            nId_UGrupo: 9901,
            nId_Usuario: 16068,
            nid_grupo: 219,
            cNombre_Grupo: 'ADEX INSTITUTO',
          });

        assert.deepEqual(group, {
          idUsuarioGrupo: 9901,
          idUsuario: 16068,
          idGrupo: 219,
          nombre: 'ADEX INSTITUTO',
        });
      }
    ),

    test(
      'calcula solo altas y bajas reales de grupos al guardar',
      () => {
        const first =
          createGroup(219, 9001);
        const removed =
          createGroup(233, 9002);
        const added =
          createGroup(247, null);

        const diff = getUsuarioGrupoDiff(
          [first, removed],
          [first, added]
        );

        assert.deepEqual(
          diff.agregar.map(
            (group) => group.idGrupo
          ),
          [247]
        );
        assert.deepEqual(
          diff.quitar.map(
            (group) => group.idGrupo
          ),
          [233]
        );
      }
    ),
  ]
);
