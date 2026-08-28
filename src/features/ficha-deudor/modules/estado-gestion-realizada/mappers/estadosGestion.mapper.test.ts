import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import {
  mapEstadoGestion,
  mapEstadosGestion,
  mapEstadoGestionHistorico,
  mapEstadosGestionHistoricos,
} from './estadosGestion.mapper';

export const suite = defineSuite('estadosGestion.mapper', [
  test('mapea el resumen sin perder el operador ni la fecha de gestión', () => {
    assert.deepEqual(
      mapEstadoGestion({
        nId_DocxCobrarOpe: 41,
        nro: 2,
        fechaGestion: '2026-08-27T10:30:00',
        operador: 'OPERADOR 1',
        documento: 'FAC-001',
        operacion: 'LLAMADA',
        resultado: 'CONTACTADO',
        comentario: 'Promesa registrada',
      }),
      {
        id: '41',
        nro: 2,
        fecha: '2026-08-27T10:30:00',
        operador: 'OPERADOR 1',
        documento: 'FAC-001',
        operacion: 'LLAMADA',
        resultado: 'CONTACTADO',
        comentario: 'Promesa registrada',
      }
    );
  }),
  test('normaliza campanna como campana en el histórico', () => {
    assert.deepEqual(
      mapEstadoGestionHistorico({
        nId_DocxCobrarOpe: 52,
        nro: 3,
        cliente: 'CLIENTE',
        cartera: 'CARTERA',
        campanna: 'AGOSTO 2026',
        fecha: '2026-08-27',
        gestor: 'GESTOR 1',
        documento: 'DOC-01',
        operacion: 'VISITA',
        resultado: 'UBICADO',
        comentario: 'Sin observaciones',
      }),
      {
        id: '52',
        nro: 3,
        cliente: 'CLIENTE',
        cartera: 'CARTERA',
        campana: 'AGOSTO 2026',
        fecha: '2026-08-27',
        gestor: 'GESTOR 1',
        documento: 'DOC-01',
        operacion: 'VISITA',
        resultado: 'UBICADO',
        comentario: 'Sin observaciones',
      }
    );
  }),
  test('mantiene orden y colecciones vacías en los mapeos múltiples', () => {
    const items = [
      {
        nId_DocxCobrarOpe: 2,
        nro: 2,
        fechaGestion: '2026-08-27',
        operador: 'B',
        documento: 'D2',
        operacion: 'O2',
        resultado: 'R2',
        comentario: 'C2',
      },
      {
        nId_DocxCobrarOpe: 1,
        nro: 1,
        fechaGestion: '2026-08-26',
        operador: 'A',
        documento: 'D1',
        operacion: 'O1',
        resultado: 'R1',
        comentario: 'C1',
      },
    ];

    assert.deepEqual(
      mapEstadosGestion(items).map((item) => item.id),
      ['2', '1']
    );
    assert.deepEqual(mapEstadosGestion([]), []);
    assert.deepEqual(mapEstadosGestionHistoricos([]), []);
  }),
]);
