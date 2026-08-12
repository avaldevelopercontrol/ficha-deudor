import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  buildCreateUsuarioRequest,
} from './crearUsuario.mapper';

import type {
  RegistrarUsuarioFormData,
} from '../modules/mantener-usuario/types/registrarUsuario.types';

const createValidForm = (): RegistrarUsuarioFormData => ({
  dni: '12345678',
  nombre: 'Juan',
  apellidoPaterno: 'Perez',
  apellidoMaterno: 'Quispe',
  usuario: 'jperez',
  contrasena: 'Clave123!',
  perfil: '12',
  grupo: '8',
  estado: true,
  fechaNacimiento: '1995-06-20',
  sexo: 1,
  departamentoLabor: '15',
  ciudadGestor: 'Lima',
  subZonalOficina: '0',
  movilEmpresa: '987654321',
  anexo: '1234',
  emailEmpresa: 'JPEREZ@EMPRESA.COM',
  emailPersonal: 'JPEREZ@CORREO.COM',
  campanaDiscador: '0',
});

export const suite = defineSuite(
  'crearUsuario.mapper',
  [
    test(
      'envía cod_Recau vacío porque el campo no aplica al registro de usuario',
      () => {
        const request =
          buildCreateUsuarioRequest(
            createValidForm()
          );

        assert.equal(
          request.cod_Recau,
          ''
        );
      }
    ),

    test(
      'mantiene el contrato del POST al retirar código recaudador de la UI',
      () => {
        const request =
          buildCreateUsuarioRequest(
            createValidForm()
          );

        assert.equal(
          Object.hasOwn(
            request,
            'cod_Recau'
          ),
          true
        );
        assert.equal(
          request.cUsr_Login,
          'jperez'
        );
        assert.equal(
          request.nid_perfil,
          12
        );
        assert.equal(
          request.nId_Grupo,
          8
        );
      }
    ),
  ]
);
