import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';

import type {
  PortfolioPagination,
} from '../../../types/portfolioControlCenter.types';
import {
  formatPortfolioPromiseCurrencyFilterOption,
  formatPortfolioPromiseDate,
  resolvePortfolioPromisePagination,
} from './portfolioPromiseDetail.utils';

const pagination: PortfolioPagination = {
  page: 3,
  pageSize: 10,
  totalItems: 26,
  totalPages: 3,
  hasPreviousPage: true,
  hasNextPage: false,
};

export const suite = defineSuite(
  'portfolioPromiseDetail.utils',
  [
    test('usa la paginación confirmada por Analytics sobre la solicitada', () => {
      assert.deepEqual(
        resolvePortfolioPromisePagination(pagination, 2, 25),
        {
          currentPage: 3,
          pageSize: 10,
          totalRecords: 26,
          totalPages: 3,
          startIndex: 20,
          endIndex: 26,
        }
      );
    }),
    test('mantiene índices vacíos cuando todavía no existe respuesta', () => {
      assert.deepEqual(
        resolvePortfolioPromisePagination(null, 2, 25),
        {
          currentPage: 2,
          pageSize: 25,
          totalRecords: 0,
          totalPages: 0,
          startIndex: 0,
          endIndex: 0,
        }
      );
    }),
    test('formatea fechas ISO de detalle sin alterar valores desconocidos', () => {
      assert.equal(
        formatPortfolioPromiseDate('2026-09-02', '—'),
        '02/09/2026'
      );
      assert.equal(
        formatPortfolioPromiseDate('02-09-2026', '—'),
        '02-09-2026'
      );
    }),
    test('respeta el texto vacío específico de cada detalle', () => {
      assert.equal(formatPortfolioPromiseDate(null, '—'), '—');
      assert.equal(
        formatPortfolioPromiseDate(null, 'Sin pago'),
        'Sin pago'
      );
    }),
    test('formatea opciones monetarias numéricas usando el formatter común', () => {
      const result = formatPortfolioPromiseCurrencyFilterOption('1250.5');

      assert.match(result, /1[,.]250/);
    }),
    test('mantiene intacta una opción monetaria no numérica', () => {
      assert.equal(
        formatPortfolioPromiseCurrencyFilterOption('Sin monto'),
        'Sin monto'
      );
    }),
  ]
);
