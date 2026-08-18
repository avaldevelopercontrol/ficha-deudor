import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import type {
  EditarUsuarioFormData,
  EditarUsuarioOriginalValues,
} from '../modules/mantener-usuario/types/editarUsuario.types';

import type {
  UsuarioDetalleApi,
} from '../types/editarUsuario.types';

import {
  fetchUsuarioById,
  updateUsuario,
} from './usuariosApi';

const createJsonResponse = (
  body: unknown,
  status = 200
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

const form: EditarUsuarioFormData = {
  dni: '76139068',
  nombre: 'Junior Abraham',
  apellidoPaterno: 'Perez',
  apellidoMaterno: 'Huamani',
  usuario: '16068',
  contrasenaActual: '',
  cambiarContrasena: false,
  contrasenaNueva: '',
  perfil: '9',
  estado: true,
  fechaNacimiento: '2003-07-26',
  sexo: 1,
  departamentoLabor: '1379',
  ciudadGestor: '',
  subZonalOficina: '26',
  movilEmpresa: '',
  anexo: '1234',
  emailEmpresa: '',
  emailPersonal: '',
  campanaDiscador: '0',
};

const original: EditarUsuarioOriginalValues = {
  idUsuario: 16068,
  dni: '76139068',
  usuario: '16068',
  passwordPersistida:
    'hash-persistido',
  anexo: '1234',
  grupoPrincipalId: 246,
  codigoRecaudador: '',
};

const createPersistedUser = (
  overrides: Partial<UsuarioDetalleApi> = {}
): UsuarioDetalleApi => ({
  nId_Usuario: 16068,
  cUsr_NroDoc: form.dni,
  cUsr_ApePat:
    form.apellidoPaterno,
  cUsr_ApeMat:
    form.apellidoMaterno,
  cUsr_Nombres: form.nombre,
  bSexo: Number(form.sexo),
  cUsr_Login: form.usuario,
  cUsr_Pass: 'hash-persistido',
  bEstado: form.estado,
  dUsr_FecNac:
    `${form.fechaNacimiento}T00:00:00`,
  nId_Ubigeo: Number(
    form.departamentoLabor
  ),
  nId_Grupo: 246,
  nid_perfil: Number(form.perfil),
  cod_Recau: '',
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
  ...overrides,
});

const createSuccessUpdateBody = () => ({
  code: '00',
  message: 'OK',
  messageUser: 'OK',
  statusCode: 200,
  response: {
    nId_Usuario: 16068,
    cUsr_NroDoc: form.dni,
    cUsr_ApePat:
      form.apellidoPaterno,
    cUsr_ApeMat:
      form.apellidoMaterno,
    cUsr_Nombres: form.nombre,
    cUsr_Login: form.usuario,
  },
});

const createSuccessDetailBody = (
  overrides: Partial<UsuarioDetalleApi> = {}
) => ({
  code: '00',
  message: 'OK',
  messageUser: 'OK',
  statusCode: 200,
  response:
    createPersistedUser(overrides),
});

export const suite = defineSuite(
  'usuariosApi edición',
  [
    test(
      'obtiene el detalle sin caché desde GET /v1/Usuario/{nId_Usuario}',
      async () => {
        const originalFetch =
          globalThis.fetch;
        let capturedUrl = '';
        let capturedMethod = '';
        let capturedCache:
          RequestCache | undefined;

        globalThis.fetch = async (
          input,
          init
        ) => {
          capturedUrl = String(input);
          capturedMethod =
            init?.method ?? 'GET';
          capturedCache = init?.cache;

          return createJsonResponse(
            createSuccessDetailBody()
          );
        };

        try {
          const result =
            await fetchUsuarioById(
              16068
            );

          assert.equal(
            result.nId_Usuario,
            16068
          );
          assert.equal(
            capturedMethod,
            'GET'
          );
          assert.equal(
            capturedCache,
            'no-store'
          );
          assert.match(
            capturedUrl,
            /\/v1\/Usuario\/16068$/
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),

    test(
      'conserva la contraseña del GET cuando bCambioPass es false y verifica la persistencia con GET',
      async () => {
        const originalFetch =
          globalThis.fetch;
        let capturedBody:
          Record<string, unknown> = {};
        const methods: string[] = [];

        globalThis.fetch = async (
          _input,
          init
        ) => {
          const method =
            init?.method ?? 'GET';
          methods.push(method);

          if (method === 'PUT') {
            capturedBody = JSON.parse(
              String(init?.body)
            ) as Record<
              string,
              unknown
            >;

            return createJsonResponse(
              createSuccessUpdateBody()
            );
          }

          return createJsonResponse(
            createSuccessDetailBody()
          );
        };

        try {
          await updateUsuario(
            form,
            original
          );

          assert.deepEqual(
            methods,
            ['PUT', 'GET']
          );
          assert.equal(
            capturedBody.nId_Grupo,
            246
          );
          assert.equal(
            capturedBody.bCambioPass,
            false
          );
          assert.equal(
            capturedBody.cUsr_Pass,
            'hash-persistido'
          );
          assert.equal(
            capturedBody.cUsr_PassNew,
            'hash-persistido'
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),

    test(
      'rechaza un HTTP 200 con código de negocio de error',
      async () => {
        const originalFetch =
          globalThis.fetch;
        let calls = 0;

        globalThis.fetch = async () => {
          calls += 1;

          return createJsonResponse({
            code: '052',
            message:
              'No se actualizó el usuario.',
            messageUser:
              'No se actualizó el usuario.',
            statusCode: 200,
            response: {
              nId_Usuario: 16068,
            },
          });
        };

        try {
          await assert.rejects(
            () =>
              updateUsuario(
                form,
                original
              ),
            /No se actualizó el usuario/i
          );
          assert.equal(calls, 1);
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),

    test(
      'rechaza el éxito aparente cuando el GET posterior demuestra que el backend no persistió el cambio',
      async () => {
        const originalFetch =
          globalThis.fetch;

        globalThis.fetch = async (
          _input,
          init
        ) => {
          if (init?.method === 'PUT') {
            return createJsonResponse(
              createSuccessUpdateBody()
            );
          }

          return createJsonResponse(
            createSuccessDetailBody({
              cUsr_Anexo: '9999',
            })
          );
        };

        try {
          await assert.rejects(
            () =>
              updateUsuario(
                form,
                original
              ),
            /Campos sin persistir: anexo/i
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),
  ]
);
