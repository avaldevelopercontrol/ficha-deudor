import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  resolveProduccionGestorHoyIdentity,
} from './produccionGestorHoyIdentity.utils';

export const suite = defineSuite(
  'produccionGestorHoyIdentity.utils',
  [
    test('normaliza identificadores válidos para API y popup', () => {
      assert.deepEqual(
        resolveProduccionGestorHoyIdentity(
          ' 25 ',
          ' 70 '
        ),
        {
          idCliente: '25',
          idUsuario: '70',
        }
      );
    }),
    test('rechaza identificadores vacíos cero negativos decimales o texto', () => {
      for (const value of [
        '',
        '0',
        '-1',
        '1.5',
        '1e3',
        'abc',
      ]) {
        assert.equal(
          resolveProduccionGestorHoyIdentity(
            value,
            '70'
          ),
          null
        );
        assert.equal(
          resolveProduccionGestorHoyIdentity(
            '25',
            value
          ),
          null
        );
      }
    }),
  ]
);
