import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { createCliente } from '../../../test/factories/auth.factory';
import {
  aniosToSelectOptions,
  clienteToSelectOptions,
} from './clienteOptions.utils';

export const suite = defineSuite('clienteOptions.utils', [
  test('convierte relaciones cliente-grupo a opciones sin alterar su orden', () => {
    const options = clienteToSelectOptions([
      createCliente({
        id_cliente: '95',
        id_grupo: 156,
        nombre: 'CLARO',
      }),
      createCliente({
        id_cliente: '12',
        id_grupo: 20,
        nombre: 'MOVISTAR',
      }),
    ]);

    assert.deepEqual(options, [
      { id: '95:156', label: 'CLARO' },
      { id: '12:20', label: 'MOVISTAR' },
    ]);
  }),
  test('distingue visualmente grupos distintos del mismo cliente', () => {
    const options = clienteToSelectOptions([
      createCliente({
        id_cliente: '27',
        id_grupo: 22,
        nombre: 'BACKUS',
      }),
      createCliente({
        id_cliente: '27',
        id_grupo: 168,
        nombre: 'BACKUS',
      }),
    ]);

    assert.deepEqual(options, [
      { id: '27:22', label: 'BACKUS (Grupo 22)' },
      { id: '27:168', label: 'BACKUS (Grupo 168)' },
    ]);
  }),
  test('mantiene una colección vacía cuando no hay clientes', () => {
    assert.deepEqual(clienteToSelectOptions([]), []);
  }),
  test('convierte los años a opciones sin alterar su orden', () => {
    assert.deepEqual(
      aniosToSelectOptions([2026, 2025, 2024]),
      [
        { id: 2026, label: '2026' },
        { id: 2025, label: '2025' },
        { id: 2024, label: '2024' },
      ]
    );
  }),
]);
