import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import {
  mapGestionHistorica,
  mapGestionRealizada,
  mapGestionesHistoricas,
  mapGestionesRealizadas,
} from './gestionesRealizadas.mapper';

export const suite = defineSuite('gestionesRealizadas.mapper', [
  test('mapea la respuesta resumida al contrato de la tabla', () => {
    assert.deepEqual(
      mapGestionRealizada({
        nId_DocxCobrarOpe: 88,
        nro: 1,
        fechaGestion: '2026-08-27T08:00:00',
        gestor: 'GESTOR UNO',
        documento: 'DOC-88',
        operacion: 'LLAMADA',
        respuesta: 'PROMESA DE PAGO',
        comentario: 'Llamar mañana',
      }),
      {
        id: '88',
        nro: 1,
        fecha: '2026-08-27T08:00:00',
        gestor: 'GESTOR UNO',
        documento: 'DOC-88',
        operacion: 'LLAMADA',
        respuesta: 'PROMESA DE PAGO',
        comentario: 'Llamar mañana',
      }
    );
  }),
  test('mapea el histórico y corrige el nombre contractual de campaña', () => {
    assert.deepEqual(
      mapGestionHistorica({
        nId_DocxCobrarOpe: 99,
        nro: 5,
        cliente: 'CLIENTE',
        cartera: 'CARTERA',
        campanna: '2026-08',
        fecha: '2026-08-27',
        gestor: 'GESTOR DOS',
        documento: 'DOC-99',
        operacion: 'EMAIL',
        resultado: 'ENVIADO',
        comentario: 'Notificación enviada',
      }),
      {
        id: '99',
        nro: 5,
        cliente: 'CLIENTE',
        cartera: 'CARTERA',
        campana: '2026-08',
        fecha: '2026-08-27',
        gestor: 'GESTOR DOS',
        documento: 'DOC-99',
        operacion: 'EMAIL',
        resultado: 'ENVIADO',
        comentario: 'Notificación enviada',
      }
    );
  }),
  test('convierte respuestas nulas o ausentes en colecciones vacías', () => {
    assert.deepEqual(mapGestionesRealizadas(null), []);
    assert.deepEqual(mapGestionesRealizadas(undefined), []);
    assert.deepEqual(mapGestionesHistoricas(null), []);
    assert.deepEqual(mapGestionesHistoricas(undefined), []);
  }),
]);
