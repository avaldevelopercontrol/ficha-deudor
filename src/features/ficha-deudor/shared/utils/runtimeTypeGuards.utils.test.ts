import assert from 'node:assert/strict';
import {
  createObjectGuard,
  isBoolean,
  isInteger,
  isOptionalNullableInteger,
  isString,
} from './runtimeTypeGuards.utils';
import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

interface ExampleApiDto {
  id: number;
  nombre: string;
  activo: boolean;
  parentId?: number | null;
}

const isExampleApiDto = createObjectGuard<ExampleApiDto>({
  id: isInteger,
  nombre: isString,
  activo: isBoolean,
  parentId: isOptionalNullableInteger,
});

export const suite = defineSuite('runtimeTypeGuards.utils', [
  test('acepta un DTO que cumple el contrato declarado', () => {
    assert.equal(
      isExampleApiDto({
        id: 10,
        nombre: 'Ejemplo',
        activo: true,
        parentId: null,
      }),
      true
    );
  }),
  test('rechaza un DTO cuando cambia el tipo de un campo obligatorio', () => {
    assert.equal(
      isExampleApiDto({
        id: '10',
        nombre: 'Ejemplo',
        activo: true,
      }),
      false
    );
  }),
  test('rechaza arreglos y valores nulos como objetos de API', () => {
    assert.equal(isExampleApiDto([]), false);
    assert.equal(isExampleApiDto(null), false);
  }),
  test('acepta campos opcionales ausentes y nullable válidos', () => {
    assert.equal(
      isExampleApiDto({
        id: 10,
        nombre: 'Ejemplo',
        activo: false,
      }),
      true
    );

    assert.equal(
      isExampleApiDto({
        id: 10,
        nombre: 'Ejemplo',
        activo: false,
        parentId: 4,
      }),
      true
    );
  }),
]);
