import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../test/testHarness';
import {
  createAsyncResourceController,
} from './asyncResource.utils';

const createDeferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>(
    (resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    }
  );

  return {
    promise,
    resolve,
    reject,
  };
};

export const suite = defineSuite(
  'asyncResource.utils',
  [
    test(
      'cancela la consulta anterior cuando comienza una nueva',
      async () => {
        const controller =
          createAsyncResourceController<string>();
        const firstDeferred =
          createDeferred<string>();
        const firstSignal = {
          value: null as AbortSignal | null,
        };

        const firstExecution =
          controller.execute((signal) => {
            firstSignal.value = signal;
            return firstDeferred.promise;
          });

        const secondExecution =
          controller.execute(async () => 'reciente');

        assert.equal(
          firstSignal.value?.aborted,
          true
        );
        assert.deepEqual(
          await secondExecution,
          {
            status: 'success',
            data: 'reciente',
          }
        );

        firstDeferred.resolve('antigua');

        assert.deepEqual(
          await firstExecution,
          {
            status: 'aborted',
          }
        );
      }
    ),

    test(
      'descarta respuestas antiguas aunque la operación ignore AbortSignal',
      async () => {
        const controller =
          createAsyncResourceController<number>();
        const firstDeferred =
          createDeferred<number>();
        const secondDeferred =
          createDeferred<number>();

        const firstExecution =
          controller.execute(
            async () => firstDeferred.promise
          );
        const secondExecution =
          controller.execute(
            async () => secondDeferred.promise
          );

        secondDeferred.resolve(2);
        firstDeferred.resolve(1);

        assert.deepEqual(
          await secondExecution,
          {
            status: 'success',
            data: 2,
          }
        );
        assert.deepEqual(
          await firstExecution,
          {
            status: 'aborted',
          }
        );
      }
    ),

    test(
      'devuelve errores vigentes y permite volver a consultar',
      async () => {
        const controller =
          createAsyncResourceController<string>();
        const expectedError = new Error(
          'Error controlado'
        );

        const failedResult =
          await controller.execute(async () => {
            throw expectedError;
          });

        assert.equal(
          failedResult.status,
          'error'
        );

        if (failedResult.status !== 'error') {
          throw new Error(
            'Se esperaba un resultado de error.'
          );
        }

        assert.equal(
          failedResult.error,
          expectedError
        );

        assert.deepEqual(
          await controller.execute(
            async () => 'reintento'
          ),
          {
            status: 'success',
            data: 'reintento',
          }
        );
      }
    ),

    test(
      'la cancelación explícita invalida una respuesta pendiente',
      async () => {
        const controller =
          createAsyncResourceController<string>();
        const deferred =
          createDeferred<string>();

        const execution =
          controller.execute(
            async () => deferred.promise
          );

        controller.cancel();
        deferred.resolve('resultado tardío');

        assert.deepEqual(
          await execution,
          {
            status: 'aborted',
          }
        );
      }
    ),
  ]
);
