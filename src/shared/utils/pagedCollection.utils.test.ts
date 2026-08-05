import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../test/testHarness';
import {
  buildRemainingPageNumbers,
  fetchAllPagesInParallel,
} from './pagedCollection.utils';

interface TestPage {
  items: string[];
  totalPages: number;
}

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

export const suite = defineSuite(
  'pagedCollection.utils',
  [
    test(
      'construye únicamente los números posteriores a la primera página',
      () => {
        assert.deepEqual(
          buildRemainingPageNumbers(4, 1),
          [2, 3, 4]
        );
        assert.deepEqual(
          buildRemainingPageNumbers(1, 1),
          []
        );
      }
    ),

    test(
      'evita solicitudes adicionales cuando todos los registros están en la primera página',
      async () => {
        const requestedPages: number[] = [];

        const result = await fetchAllPagesInParallel<
          TestPage,
          string
        >({
          firstPageNumber: 1,
          fetchPage: async (pageNumber) => {
            requestedPages.push(pageNumber);

            return {
              items: ['página 1'],
              totalPages: 1,
            };
          },
          getItems: (page) => page.items,
          getTotalPages: (page) => page.totalPages,
        });

        assert.deepEqual(requestedPages, [1]);
        assert.deepEqual(result, ['página 1']);
      }
    ),

    test(
      'inicia juntas las páginas restantes y conserva su orden al unirlas',
      async () => {
        const requestedPages: number[] = [];
        const deferredByPage = new Map(
          [2, 3, 4].map((pageNumber) => [
            pageNumber,
            createDeferred<TestPage>(),
          ])
        );

        const resultPromise =
          fetchAllPagesInParallel<TestPage, string>({
            firstPageNumber: 1,
            fetchPage: async (pageNumber) => {
              requestedPages.push(pageNumber);

              if (pageNumber === 1) {
                return {
                  items: ['página 1'],
                  totalPages: 4,
                };
              }

              const deferred =
                deferredByPage.get(pageNumber);

              if (!deferred) {
                throw new Error(
                  `Página inesperada: ${pageNumber}`
                );
              }

              return deferred.promise;
            },
            getItems: (page) => page.items,
            getTotalPages: (page) => page.totalPages,
          });

        await Promise.resolve();
        await Promise.resolve();

        assert.deepEqual(
          requestedPages,
          [1, 2, 3, 4]
        );

        deferredByPage.get(4)?.resolve({
          items: ['página 4'],
          totalPages: 4,
        });
        deferredByPage.get(2)?.resolve({
          items: ['página 2'],
          totalPages: 4,
        });
        deferredByPage.get(3)?.resolve({
          items: ['página 3'],
          totalPages: 4,
        });

        assert.deepEqual(
          await resultPromise,
          [
            'página 1',
            'página 2',
            'página 3',
            'página 4',
          ]
        );
      }
    ),
  ]
);
