import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { env } from '@app/config/env';
import { createLoginUsuarioApi } from '../../../test/factories/auth.factory';
import { fetchClientesByUsuario, login } from './authApi';

interface CapturedRequest {
  input: RequestInfo | URL;
  init?: RequestInit;
}

const createJsonResponse = (
  body: unknown,
  status = 200
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const withFetchResponse = async <T>(
  response: Response,
  run: (request: CapturedRequest) => Promise<T>
): Promise<T> => {
  const originalFetch = globalThis.fetch;
  let capturedRequest: CapturedRequest | null = null;

  globalThis.fetch = async (input, init) => {
    capturedRequest = { input, init };
    return response;
  };

  try {
    const pendingResult = run(
      new Proxy({} as CapturedRequest, {
        get: (_target, property) => {
          if (!capturedRequest) {
            throw new Error('La solicitud fetch todavía no fue ejecutada.');
          }

          return capturedRequest[property as keyof CapturedRequest];
        },
      })
    );

    return await pendingResult;
  } finally {
    globalThis.fetch = originalFetch;
  }
};

export const suite = defineSuite('authApi', [
  test('acepta respuestas 2xx válidas y aplica opciones de seguridad del GET vigente', async () => {
    const controller = new AbortController();

    await withFetchResponse(
      createJsonResponse({
        code: '00',
        message: 'Login exitoso',
        messageUser: '',
        statusCode: 201,
        response: createLoginUsuarioApi(),
      }),
      async (request) => {
        const result = await login(
          {
            username: '  cramirez  ',
            password: 'a&b=c?#',
          },
          controller.signal
        );
        const url = new URL(String(request.input), 'http://localhost');
        assert.equal(result.success, true);
        assert.equal(result.usuario?.id_usuario, '16068');
        assert.equal(url.searchParams.get('cUsr_Login'), 'cramirez');
        assert.equal(url.searchParams.get('cUsr_Pass'), 'a&b=c?#');
        assert.equal(request.init?.method, 'GET');
        assert.equal(request.init?.signal, controller.signal);
        assert.equal(request.init?.cache, 'no-store');
        assert.equal(request.init?.referrerPolicy, 'no-referrer');
        assert.deepEqual(request.init?.headers, {
          Accept: 'application/json',
        });
      }
    );
  }),
  test('prioriza el mensaje de usuario cuando la aplicación rechaza el login', async () => {
    await withFetchResponse(
      createJsonResponse({
        code: '01',
        message: 'Detalle técnico',
        messageUser: 'Credenciales inválidas',
        statusCode: 200,
        response: null,
      }),
      async () => {
        const result = await login({
          username: 'usuario',
          password: 'secreto',
        });

        assert.deepEqual(result, {
          success: false,
          code: '01',
          message: 'Credenciales inválidas',
          usuario: null,
        });
      }
    );
  }),
  test('detecta code 092 con response null y exige el cambio de clave', async () => {
    await withFetchResponse(
      createJsonResponse({
        code: '092',
        message: 'Su clave ha expirado.',
        messageUser: 'Su clave ha expirado.',
        statusCode: 400,
        response: null,
      }),
      async () => {
        const result = await login({
          username: '16149',
          password: 'secreto',
        });

        assert.equal(result.success, false);
        assert.equal(result.code, '092');
        assert.equal(result.requiresPasswordChange, true);
        assert.equal(result.message, 'Su clave ha expirado.');
        assert.equal(result.usuario, null);
      }
    );
  }),
  test('recupera code 092 con response null aunque el HTTP no sea exitoso', async () => {
    await withFetchResponse(
      createJsonResponse(
        {
          code: '092',
          message: 'Debe actualizar su clave antes de continuar.',
          messageUser: '',
          statusCode: 400,
          response: null,
        },
        400
      ),
      async () => {
        const result = await login({
          username: '16149',
          password: 'secreto',
        });

        assert.equal(result.success, false);
        assert.equal(result.code, '092');
        assert.equal(result.requiresPasswordChange, true);
        assert.equal(result.usuario, null);
        assert.equal(
          result.message,
          'Debe actualizar su clave antes de continuar.'
        );
      }
    );
  }),
  test('detecta code 093 como login válido y conserva message para advertir la expiración próxima', async () => {
    await withFetchResponse(
      createJsonResponse({
        code: '093',
        message:
          'Debe cambiar su clave. Faltan 5 días para el bloqueo de su usuario por expiración de clave.',
        messageUser: 'Mensaje alternativo',
        statusCode: 200,
        response: createLoginUsuarioApi(),
      }),
      async () => {
        const result = await login({
          username: 'usuario',
          password: 'secreto',
        });

        assert.equal(result.success, true);
        assert.equal(result.code, '093');
        assert.equal(result.requiresPasswordChangeSoon, true);
        assert.equal(
          result.message,
          'Debe cambiar su clave. Faltan 5 días para el bloqueo de su usuario por expiración de clave.'
        );
        assert.equal(result.usuario?.id_usuario, '16068');
      }
    );
  }),
  test('recupera code 093 también si el servidor lo acompaña con un HTTP no exitoso', async () => {
    await withFetchResponse(
      createJsonResponse(
        {
          code: '093',
          message: 'Debe cambiar su clave antes de que expire.',
          messageUser: '',
          statusCode: 401,
          response: createLoginUsuarioApi(),
        },
        401
      ),
      async () => {
        const result = await login({
          username: 'usuario',
          password: 'secreto',
        });

        assert.equal(result.success, true);
        assert.equal(result.code, '093');
        assert.equal(result.requiresPasswordChangeSoon, true);
        assert.equal(
          result.message,
          'Debe cambiar su clave antes de que expire.'
        );
      }
    );
  }),
  test('detecta code 094 como login rechazado y prioriza message para informar el exceso de intentos', async () => {
    await withFetchResponse(
      createJsonResponse({
        code: '094',
        message: 'Ha excedido la cantidad de intentos permitidos.',
        messageUser: 'Mensaje alternativo',
        statusCode: 200,
        response: null,
      }),
      async () => {
        const result = await login({
          username: 'usuario',
          password: 'secreto',
        });

        assert.deepEqual(result, {
          success: false,
          code: '094',
          message: 'Ha excedido la cantidad de intentos permitidos.',
          usuario: null,
        });
      }
    );
  }),
  test('recupera code 094 y su message aunque el servidor responda con HTTP no exitoso', async () => {
    await withFetchResponse(
      createJsonResponse(
        {
          code: '094',
          message: 'Ha excedido la cantidad de intentos permitidos.',
          messageUser: '',
          statusCode: 401,
          response: null,
        },
        401
      ),
      async () => {
        const result = await login({
          username: 'usuario',
          password: 'secreto',
        });

        assert.equal(result.success, false);
        assert.equal(result.code, '094');
        assert.equal(
          result.message,
          'Ha excedido la cantidad de intentos permitidos.'
        );
        assert.equal(result.usuario, null);
      }
    );
  }),
  test('rechaza usuarios inactivos y respuestas de usuario manipuladas', async () => {
    await withFetchResponse(
      createJsonResponse({
        code: '00',
        message: '',
        messageUser: '',
        statusCode: 200,
        response: createLoginUsuarioApi({ bEstado: false }),
      }),
      async () => {
        const inactive = await login({
          username: 'usuario',
          password: 'secreto',
        });

        assert.equal(inactive.success, false);
        assert.equal(inactive.message, 'El usuario se encuentra inactivo.');
      }
    );

    await withFetchResponse(
      createJsonResponse({
        code: '00',
        message: '',
        messageUser: '',
        statusCode: 200,
        response: {
          ...createLoginUsuarioApi(),
          nId_Usuario: 0,
        },
      }),
      async () => {
        const malformed = await login({
          username: 'usuario',
          password: 'secreto',
        });

        assert.equal(malformed.success, false);
        assert.equal(
          malformed.message,
          'La respuesta del servidor no contiene datos válidos.'
        );
      }
    );
  }),
  test('rechaza sobres de respuesta inválidos de forma controlada', async () => {
    await withFetchResponse(createJsonResponse('respuesta inesperada'), async () => {
      const result = await login({
        username: 'usuario',
        password: 'secreto',
      });

      assert.equal(result.success, false);
      assert.match(result.message, /datos válidos/i);
    });
  }),

  test('propaga AbortError para que la capa de autenticación descarte la solicitud', async () => {
    const originalFetch = globalThis.fetch;
    const abortError = new Error('Solicitud cancelada');
    abortError.name = 'AbortError';

    globalThis.fetch = async () => {
      throw abortError;
    };

    try {
      await assert.rejects(
        login({
          username: 'usuario',
          password: 'secreto',
        }),
        (error: unknown) =>
          error instanceof Error && error.name === 'AbortError'
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('prioriza messageUser también en errores HTTP', async () => {
    await withFetchResponse(
      createJsonResponse(
        {
          message: 'Detalle técnico del servidor',
          messageUser: 'Servicio de autenticación no disponible',
        },
        503
      ),
      async () => {
        const result = await login({
          username: 'usuario',
          password: 'secreto',
        });

        assert.deepEqual(result, {
          success: false,
          code: 'CLIENT_ERROR',
          message: 'Servicio de autenticación no disponible',
          usuario: null,
        });
      }
    );
  }),
  test('rechaza identificadores de usuario inválidos antes de cargar clientes', async () => {
    for (const idUsuario of ['', '0', '-1', '1.5', 'abc']) {
      await assert.rejects(
        fetchClientesByUsuario(idUsuario),
        /usuario válido/i
      );
    }
  }),
  test('propaga la cancelación al mock del selector de clientes', async () => {
    const previousUseClientesMock = env.useClientesMock;
    const controller = new AbortController();
    controller.abort();
    env.useClientesMock = true;

    try {
      await assert.rejects(
        fetchClientesByUsuario('16068', controller.signal),
        (error: unknown) =>
          error instanceof Error && error.name === 'AbortError'
      );
    } finally {
      env.useClientesMock = previousUseClientesMock;
    }
  }),
]);
