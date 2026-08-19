import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  POWER_BI_IMAGE_CATALOG,
  findPowerBiImageDefinition,
} from './powerBiImageCatalog.constants';

export const suite = defineSuite(
  'catálogo de logos Power BI',
  [
    test(
      'expone los 19 logos disponibles para Power BI sin rutas duplicadas',
      () => {
        assert.equal(
          POWER_BI_IMAGE_CATALOG.length,
          19
        );

        assert.equal(
          new Set(
            POWER_BI_IMAGE_CATALOG.map(
              (image) => image.src
            )
          ).size,
          POWER_BI_IMAGE_CATALOG.length
        );
      }
    ),
    test(
      'resuelve un logo del catálogo por la ruta persistida en sImagenOpcion',
      () => {
        assert.equal(
          findPowerBiImageDefinition(
            '/imgs_webp/logo-backus.webp'
          )?.label,
          'BACKUS COBRANZA'
        );

        assert.equal(
          findPowerBiImageDefinition(
            'https://cdn.example.com/logo.webp'
          ),
          null
        );
      }
    ),
  ]
);
