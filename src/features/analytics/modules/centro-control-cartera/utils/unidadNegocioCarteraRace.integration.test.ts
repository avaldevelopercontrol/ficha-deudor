import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  createAsyncResourceController,
} from '@shared/utils/asyncResource.utils';

const createDeferred = <T>() => {
  let resolve!: (value: T) => void;

  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return {
    promise,
    resolve,
  };
};

interface ScopedPortfolioResult {
  businessUnit: string;
  assignedPortfolio: number;
}

export const suite = defineSuite(
  'Portfolio Business Unit race isolation',
  [
    test(
      'un request Gobierno aborta Admin y la respuesta Admin tardía queda descartada',
      async () => {
        const controller =
          createAsyncResourceController<ScopedPortfolioResult>();
        const adminDeferred =
          createDeferred<ScopedPortfolioResult>();
        const governmentDeferred =
          createDeferred<ScopedPortfolioResult>();
        const adminSignal = {
          value: null as AbortSignal | null,
        };

        const adminExecution = controller.execute(
          (signal) => {
            adminSignal.value = signal;
            return adminDeferred.promise;
          }
        );
        const governmentExecution = controller.execute(
          async () => governmentDeferred.promise
        );

        assert.equal(adminSignal.value?.aborted, true);

        governmentDeferred.resolve({
          businessUnit: 'CLARO GOBIERNO',
          assignedPortfolio: 200,
        });

        assert.deepEqual(
          await governmentExecution,
          {
            status: 'success',
            data: {
              businessUnit: 'CLARO GOBIERNO',
              assignedPortfolio: 200,
            },
          }
        );

        adminDeferred.resolve({
          businessUnit: 'CLARO ADMINISTRATIVO',
          assignedPortfolio: 100,
        });

        assert.deepEqual(
          await adminExecution,
          { status: 'aborted' }
        );
      }
    ),
    test(
      'una operación anterior que ignora AbortSignal tampoco puede ganar después del cambio de cartera',
      async () => {
        const controller =
          createAsyncResourceController<ScopedPortfolioResult>();
        const adminDeferred =
          createDeferred<ScopedPortfolioResult>();
        const governmentDeferred =
          createDeferred<ScopedPortfolioResult>();

        const adminExecution = controller.execute(
          async () => adminDeferred.promise
        );
        const governmentExecution = controller.execute(
          async () => governmentDeferred.promise
        );

        adminDeferred.resolve({
          businessUnit: 'CLARO ADMINISTRATIVO',
          assignedPortfolio: 100,
        });
        governmentDeferred.resolve({
          businessUnit: 'CLARO GOBIERNO',
          assignedPortfolio: 200,
        });

        assert.deepEqual(
          await adminExecution,
          { status: 'aborted' }
        );
        assert.equal(
          (await governmentExecution).status,
          'success'
        );
      }
    ),
  ]
);
