import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../test/testHarness';
import {
  isValidPopupId,
} from './popupId.utils';

export const suite = defineSuite(
  'popupId.utils',
  [
    test(
      'acepta identificadores de popup compactos',
      () => {
        assert.equal(
          isValidPopupId('popup-123'),
          true
        );
      }
    ),
    test(
      'rechaza valores vacíos con espacios o separadores reservados',
      () => {
        assert.equal(isValidPopupId(''), false);
        assert.equal(isValidPopupId(' popup-123'), false);
        assert.equal(isValidPopupId('popup-123 '), false);
        assert.equal(isValidPopupId('popup:123'), false);
      }
    ),
    test(
      'rechaza tipos incorrectos e identificadores excesivos',
      () => {
        assert.equal(isValidPopupId(123), false);
        assert.equal(
          isValidPopupId('a'.repeat(129)),
          false
        );
      }
    ),
  ]
);
