import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../test/testHarness';
import { createAsyncMutationController } from './asyncMutation.utils';

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
  'asyncMutation.utils',
  [
    test(
      'ignora una segunda ejecución mientras la primera continúa pendiente',
      async () => {
        const controller =
          createAsyncMutationController();
        const deferred = createDeferred<string>();
        let executionCount = 0;

        const firstExecution = controller.execute(
          async () => {
            executionCount += 1;
            return deferred.promise;
          }
        );

        const secondExecution =
          await controller.execute(async () => {
            executionCount += 1;
            return 'duplicada';
          });

        assert.equal(
          controller.isPending(),
          true
        );
        assert.equal(executionCount, 1);
        assert.deepEqual(secondExecution, {
          status: 'skipped',
        });

        deferred.resolve('guardada');

        assert.deepEqual(await firstExecution, {
          status: 'success',
          data: 'guardada',
        });
        assert.equal(
          controller.isPending(),
          false
        );
      }
    ),

    test(
      'libera el bloqueo después de completar correctamente',
      async () => {
        const controller =
          createAsyncMutationController();

        const firstResult =
          await controller.execute(async () => 1);
        const secondResult =
          await controller.execute(async () => 2);

        assert.deepEqual(firstResult, {
          status: 'success',
          data: 1,
        });
        assert.deepEqual(secondResult, {
          status: 'success',
          data: 2,
        });
      }
    ),

    test(
      'devuelve el error y permite reintentar después de una falla',
      async () => {
        const controller =
          createAsyncMutationController();
        const expectedError = new Error(
          'Falla controlada'
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
        assert.equal(
          controller.isPending(),
          false
        );

        const retryResult =
          await controller.execute(
            async () => 'reintento correcto'
          );

        assert.deepEqual(retryResult, {
          status: 'success',
          data: 'reintento correcto',
        });
      }
    ),

    test(
      'captura errores síncronos de la operación sin conservar el bloqueo',
      async () => {
        const controller =
          createAsyncMutationController();

        const result = await controller.execute(
          () => {
            throw new Error('Error síncrono');
          }
        );

        assert.equal(result.status, 'error');
        assert.equal(
          controller.isPending(),
          false
        );
      }
    ),
  ]
);
