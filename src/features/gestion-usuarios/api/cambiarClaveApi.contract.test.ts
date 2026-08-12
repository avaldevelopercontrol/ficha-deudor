import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  resetearClaveUsuario,
} from './cambiarClaveApi';

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

const form = {
  claveActual: 'Actual123!',
  claveNueva: 'Nueva456@',
  confirmarClaveNueva: 'Nueva456@',
};

export const suite = defineSuite(
  'cambiarClaveApi contrato',
  [
    test(
      'envía PUT con el usuario autenticado y las tres claves al endpoint correcto',
      async () => {
        const originalFetch = globalThis.fetch;
        let capturedUrl = '';
        let capturedMethod = '';
        let capturedBodyJson = '';
        const controller = new AbortController();

        globalThis.fetch = async (input, init) => {
          capturedUrl = String(input);
          capturedMethod = init?.method ?? '';
          capturedBodyJson = String(init?.body ?? '');

          assert.equal(init?.signal, controller.signal);

          return createJsonResponse({
            code: '00',
            message: 'OK',
            messageUser: 'Clave actualizada correctamente.',
            statusCode: 200,
            response: {
              nId_Usuario: 16068,
              cUsr_Login: '16068',
              cUsr_Pass: '',
            },
          });
        };

        try {
          const message = await resetearClaveUsuario(
            form,
            '16068',
            controller.signal
          );

          const url = new URL(capturedUrl);

          assert.match(
            url.pathname,
            /\/v1\/Usuario\/ResetearClaveUsuario$/
          );
          assert.equal(capturedMethod, 'PUT');

          const capturedBody = JSON.parse(
            capturedBodyJson
          ) as Record<string, unknown>;

          assert.equal(capturedBody.nId_Usuario, 16068);
          assert.equal(
            capturedBody.cUsr_PassActual,
            form.claveActual
          );
          assert.equal(
            capturedBody.cUsr_PassNueva,
            form.claveNueva
          );
          assert.equal(
            capturedBody.cUsr_PassConfirma,
            form.confirmarClaveNueva
          );
          assert.equal(
            typeof capturedBody.dFecRegistro,
            'string'
          );
          assert.equal(
            Number.isNaN(
              Date.parse(
                String(capturedBody.dFecRegistro)
              )
            ),
            false
          );
          assert.equal(
            message,
            'Clave actualizada correctamente.'
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),

    test(
      'reemplaza un OK genérico del backend por un mensaje claro para el usuario',
      async () => {
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async () =>
          createJsonResponse({
            code: '00',
            message: 'OK',
            messageUser: 'OK',
            statusCode: 200,
            response: {
              nId_Usuario: 16068,
              cUsr_Login: '16068',
              cUsr_Pass: '',
            },
          });

        try {
          const message = await resetearClaveUsuario(
            form,
            '16068'
          );

          assert.equal(
            message,
            'Tu clave de acceso se cambió correctamente.'
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),

    test(
      'prioriza messageUser cuando el backend responde HTTP 400',
      async () => {
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async () =>
          createJsonResponse(
            {
              code: '400',
              message: 'Password history validation failed',
              messageUser:
                'No puede repetir claves anteriores.',
              statusCode: 400,
              response: {},
            },
            400
          );

        try {
          await assert.rejects(
            () => resetearClaveUsuario(form, '16068'),
            /No puede repetir claves anteriores\./
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),

    test(
      'trata como error una respuesta HTTP 200 cuyo estado interno no es exitoso',
      async () => {
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async () =>
          createJsonResponse({
            code: '99',
            message: 'Error interno de negocio',
            messageUser: 'La clave actual no es correcta.',
            statusCode: 400,
            response: {},
          });

        try {
          await assert.rejects(
            () => resetearClaveUsuario(form, '16068'),
            /La clave actual no es correcta\./
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
  ]
);
