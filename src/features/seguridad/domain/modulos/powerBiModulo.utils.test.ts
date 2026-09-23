import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import {
  isPowerBiCatalogModulo,
  isValidPowerBiPublishToWebUrl,
  isValidPowerBiUrl,
  POWER_BI_CATALOG_LEVEL,
} from './powerBiModulo.utils';

export const suite = defineSuite(
  'powerBiModulo.utils',
  [
    test(
      'identifica como BI únicamente las opciones del nivel 4',
      () => {
        assert.equal(
          POWER_BI_CATALOG_LEVEL,
          4
        );

        assert.equal(
          isPowerBiCatalogModulo({
            tipo: 4,
          }),
          true
        );

        assert.equal(
          isPowerBiCatalogModulo({
            tipo: 3,
          }),
          false
        );

        assert.equal(
          isPowerBiCatalogModulo({
            tipo: 5,
          }),
          false
        );
      }
    ),
    test(
      'limita la URL general del reporte al servicio HTTPS de Power BI',
      () => {
        assert.equal(
          isValidPowerBiUrl(
            'https://app.powerbi.com/reportEmbed?reportId=abc'
          ),
          true
        );
        assert.equal(
          isValidPowerBiUrl(
            'https://example.com/reportEmbed?reportId=abc'
          ),
          false
        );
        assert.equal(
          isValidPowerBiUrl(
            'http://app.powerbi.com/view?r=abc'
          ),
          false
        );
      }
    ),
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
    test(
      'rechaza códigos duplicados, credenciales y fragmentos',
      () => {
        assert.equal(
          isValidPowerBiPublishToWebUrl(
            'https://app.powerbi.com/view?r=abc&r=def'
          ),
          false
        );
        assert.equal(
          isValidPowerBiPublishToWebUrl(
            'https://user:secret@app.powerbi.com/view?r=abc'
          ),
          false
        );
        assert.equal(
          isValidPowerBiPublishToWebUrl(
            'https://app.powerbi.com/view?r=abc#section'
          ),
          false
        );
      }
    ),
  ]
);
