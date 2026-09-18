import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';

import type {
  PortfolioPagination,
} from '../domain/promesasCartera.types';
import {
  formatPortfolioPromiseCurrencyFilterOption,
  formatPortfolioPromiseCutoffLabel,
  formatPortfolioPromiseDate,
  formatSeguimientoPromesasPeriodLabel,
  getSeguimientoPromesaEmptyActivityLabel,
  getSeguimientoPromesaStatusLabel,
  getSeguimientoPromesasCarteraDate,
  resolvePortfolioPromisePagination,
} from './detallePromesaCartera.utils';

const pagination: PortfolioPagination = {
  page: 3,
  pageSize: 10,
  totalItems: 26,
  totalPages: 3,
  hasPreviousPage: true,
  hasNextPage: false,
};

export const suite = defineSuite(
  'detallePromesaCartera.utils',
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
    test('identifica como Hoy un corte que coincide con la fecha actual de Perú', () => {
      assert.equal(
        formatPortfolioPromiseCutoffLabel(
          '2026-09-11',
          new Date('2026-09-12T04:30:00.000Z')
        ),
        'Hoy 11/09/2026'
      );
    }),
    test('identifica como dato histórico un corte anterior a la fecha actual de Perú', () => {
      assert.equal(
        formatPortfolioPromiseCutoffLabel(
          '2026-09-10',
          new Date('2026-09-11T21:13:00.000Z')
        ),
        'Datos al 10/09/2026'
      );
    }),
    test('omite el corte cuando Analytics no entrega asOfDate', () => {
      assert.equal(
        formatPortfolioPromiseCutoffLabel(
          null,
          new Date('2026-09-11T21:13:00.000Z')
        ),
        null
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
    test('resuelve Hoy y Ayer usando el calendario de Perú aun cerca de medianoche UTC', () => {
      const currentDate = new Date('2026-09-15T03:30:00.000Z');

      assert.equal(
        getSeguimientoPromesasCarteraDate('today', currentDate),
        '2026-09-14'
      );
      assert.equal(
        getSeguimientoPromesasCarteraDate('yesterday', currentDate),
        '2026-09-13'
      );
    }),
    test('formatea la etiqueta compacta del selector Hoy/Ayer', () => {
      assert.equal(
        formatSeguimientoPromesasPeriodLabel('today', '2026-09-14'),
        'Hoy · 14/09/2026'
      );
      assert.equal(
        formatSeguimientoPromesasPeriodLabel('yesterday', '2026-09-13'),
        'Ayer · 13/09/2026'
      );
    }),
    test('distingue una promesa cumplida antes de su vencimiento', () => {
      assert.equal(
        getSeguimientoPromesaStatusLabel(
          'fulfilled',
          'Cumplida',
          '2026-09-07',
          '2026-09-14'
        ),
        'Cumplida anticipadamente'
      );
      assert.equal(
        getSeguimientoPromesaStatusLabel(
          'fulfilled',
          'Cumplida',
          '2026-09-14',
          '2026-09-14'
        ),
        'Cumplida'
      );
    }),
    test('explica la ausencia de gestión según el saldo y el día seleccionado', () => {
      assert.equal(
        getSeguimientoPromesaEmptyActivityLabel(0, 'today'),
        'Sin gestión necesaria hoy'
      );
      assert.equal(
        getSeguimientoPromesaEmptyActivityLabel(120, 'today'),
        'Sin gestión hoy'
      );
      assert.equal(
        getSeguimientoPromesaEmptyActivityLabel(120, 'yesterday'),
        'Sin gestión ayer'
      );
    }),
  ]
);
