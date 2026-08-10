import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../test/testHarness';
import {
  clampPageNumber,
  resolveClientPagination,
} from './pagination.utils';

export const suite = defineSuite(
  'pagination.utils',
  [
    test(
      'mantiene una página válida dentro del total disponible',
      () => {
        assert.equal(
          clampPageNumber(3, 5),
          3
        );
        assert.equal(
          clampPageNumber(0, 5),
          1
        );
        assert.equal(
          clampPageNumber(9, 5),
          5
        );
      }
    ),

    test(
      'normaliza solicitudes no enteras o no finitas',
      () => {
        assert.equal(
          clampPageNumber(2.9, 5),
          2
        );
        assert.equal(
          clampPageNumber(Number.NaN, 5),
          1
        );
        assert.equal(
          clampPageNumber(
            Number.POSITIVE_INFINITY,
            5
          ),
          1
        );
      }
    ),

    test(
      'ajusta inmediatamente la página cuando disminuyen los registros',
      () => {
        const pagination =
          resolveClientPagination(
            15,
            10,
            5
          );

        assert.deepEqual(pagination, {
          pageNumber: 2,
          pageSize: 10,
          totalPages: 2,
          startIndex: 10,
          endIndex: 15,
        });
      }
    ),

    test(
      'mantiene una primera página válida cuando no existen registros',
      () => {
        assert.deepEqual(
          resolveClientPagination(
            0,
            10,
            4
          ),
          {
            pageNumber: 1,
            pageSize: 10,
            totalPages: 1,
            startIndex: 0,
            endIndex: 0,
          }
        );
      }
    ),
  ]
);
