import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  fetchPerfiles,
} from './usuarioCatalogosApi';

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

export const suite = defineSuite(
  'usuarioCatalogosApi perfiles',
  [
    test(
      'consume nEstadoGest de GetPerfiles y devuelve solo perfiles activos',
      async () => {
        const originalFetch = globalThis.fetch;
        let capturedUrl = '';

        globalThis.fetch = async (input) => {
          capturedUrl = String(input);

          return createJsonResponse({
            code: '00',
            message: 'OK',
            messageUser: 'OK',
            statusCode: 200,
            response: [
              {
                nid_perfil: 12,
                per_Nombre: 'Abogado',
                nEstadoGest: 1,
              },
              {
                nid_perfil: 31,
                per_Nombre: 'Cliente BITEL 1',
                nEstadoGest: 0,
              },
            ],
          });
        };

        try {
          assert.deepEqual(
            await fetchPerfiles(),
            [
              {
                id: '12',
                label: 'Abogado',
              },
            ]
          );

          assert.match(
            capturedUrl,
            /\/v1\/Perfil\/GetPerfiles$/
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
  ]
);
