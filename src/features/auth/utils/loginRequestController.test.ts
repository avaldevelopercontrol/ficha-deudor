import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../test/testHarness';
import type { LoginPayload, LoginResponse } from '../types';
import { createLoginRequestController } from './loginRequestController';

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (error: unknown) => void;
}

const createDeferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;

  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
};

const successResponse = (username: string): LoginResponse => ({
  success: true,
  message: 'Login exitoso',
  usuario: {
    id_usuario: '16068',
    nombre: 'Carlos',
    apellido: 'Ramírez',
    username,
    email: 'c.ramirez@avalperu.pe',
    perfil: 'GESTOR',
    perfilId: 2,
  },
});

const credentials = (
  username = 'usuario',
  password = 'secreto'
): LoginPayload => ({ username, password });

export const suite = defineSuite('loginRequestController', [
  test('comparte una autenticación idéntica y ejecuta una sola llamada', async () => {
    const deferred = createDeferred<LoginResponse>();
    let calls = 0;

    const controller = createLoginRequestController(async () => {
      calls += 1;
      return deferred.promise;
    });

    const first = controller.execute(credentials());
    const second = controller.execute(credentials());

    assert.equal(first, second);
    assert.equal(calls, 1);
    assert.equal(controller.isPending(), true);

    deferred.resolve(successResponse('usuario'));

    assert.deepEqual(await first, {
      status: 'completed',
      response: successResponse('usuario'),
    });
    assert.equal(controller.isPending(), false);
  }),
  test('cancela credenciales obsoletas cuando comienza un login diferente', async () => {
    const requests: Array<{
      payload: LoginPayload;
      signal: AbortSignal;
      deferred: Deferred<LoginResponse>;
    }> = [];

    const controller = createLoginRequestController(
      async (payload, signal) => {
        const deferred = createDeferred<LoginResponse>();
        requests.push({ payload, signal, deferred });
        return deferred.promise;
      }
    );

    const first = controller.execute(credentials('anterior', 'clave1'));
    const second = controller.execute(credentials('vigente', 'clave2'));

    assert.equal(requests.length, 2);
    assert.equal(requests[0]?.signal.aborted, true);
    assert.equal(requests[1]?.signal.aborted, false);

    requests[0]?.deferred.resolve(successResponse('anterior'));
    requests[1]?.deferred.resolve(successResponse('vigente'));

    assert.deepEqual(await first, { status: 'cancelled' });
    assert.deepEqual(await second, {
      status: 'completed',
      response: successResponse('vigente'),
    });
  }),
  test('la cancelación explícita invalida una respuesta aunque ignore AbortSignal', async () => {
    const deferred = createDeferred<LoginResponse>();
    const capturedSignals: AbortSignal[] = [];

    const controller = createLoginRequestController(async (_payload, signal) => {
      capturedSignals.push(signal);
      return deferred.promise;
    });

    const pending = controller.execute(credentials());
    controller.cancel();

    assert.equal(capturedSignals[0]?.aborted, true);
    assert.equal(controller.isPending(), false);

    deferred.resolve(successResponse('usuario'));
    assert.deepEqual(await pending, { status: 'cancelled' });
  }),
  test('propaga errores vigentes y permite una nueva autenticación', async () => {
    let attempts = 0;

    const controller = createLoginRequestController(async (payload) => {
      attempts += 1;

      if (attempts === 1) {
        throw new Error('Sin conexión');
      }

      return successResponse(payload.username);
    });

    await assert.rejects(
      controller.execute(credentials()),
      /Sin conexión/
    );
    assert.equal(controller.isPending(), false);

    assert.deepEqual(
      await controller.execute(credentials('reintento')),
      {
        status: 'completed',
        response: successResponse('reintento'),
      }
    );
    assert.equal(attempts, 2);
  }),
]);
