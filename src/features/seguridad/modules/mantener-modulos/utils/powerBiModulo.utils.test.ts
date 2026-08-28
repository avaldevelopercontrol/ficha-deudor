import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  isValidPowerBiPublishToWebUrl,
} from './powerBiModulo.utils';

export const suite = defineSuite(
  'powerBiModulo.utils',
  [
    test(
      'acepta una URL Publish to web válida',
      () => {
        assert.equal(
          isValidPowerBiPublishToWebUrl(
            'https://app.powerbi.com/view?r=abc123'
          ),
          true
        );
      }
    ),
    test(
      'rechaza reportEmbed porque requiere autenticación',
      () => {
        assert.equal(
          isValidPowerBiPublishToWebUrl(
            'https://app.powerbi.com/reportEmbed?reportId=abc'
          ),
          false
        );
      }
    ),
    test(
      'rechaza dominios externos y HTTP',
      () => {
        assert.equal(
          isValidPowerBiPublishToWebUrl(
            'https://example.com/view?r=abc'
          ),
          false
        );
        assert.equal(
          isValidPowerBiPublishToWebUrl(
            'http://app.powerbi.com/view?r=abc'
          ),
          false
        );
      }
    ),
    test(
      'exige el código r de la publicación',
      () => {
        assert.equal(
          isValidPowerBiPublishToWebUrl(
            'https://app.powerbi.com/view'
          ),
          false
        );
      }
    ),
  ]
);
