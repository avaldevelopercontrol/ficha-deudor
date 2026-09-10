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
      'expone los 26 logos disponibles para Power BI sin rutas duplicadas',
      () => {
        assert.equal(
          POWER_BI_IMAGE_CATALOG.length,
          26
        );

        assert.equal(
          new Set(
            POWER_BI_IMAGE_CATALOG.map(
              (image) => image.src
            )
          ).size,
          POWER_BI_IMAGE_CATALOG.length
        );

        assert.equal(
          POWER_BI_IMAGE_CATALOG.every(
            (image) => image.src.endsWith('.webp')
          ),
          true
        );
      }
    ),
    test(
      'incluye los nuevos artes y logos convertidos a WebP',
      () => {
        const catalogById = new Map(
          POWER_BI_IMAGE_CATALOG.map(
            (image) => [image.id, image]
          )
        );

        assert.equal(
          catalogById.get('asesor-gestion-campo')?.src,
          '/imgs_webp/campo.webp'
        );
        assert.equal(
          catalogById.get('indicadores-operativos')?.src,
          '/imgs_webp/analisis.webp'
        );
        assert.equal(
          catalogById.get('eficiencia-operativa')?.src,
          '/imgs_webp/kpi-eficiencia-operativa.webp'
        );
        assert.equal(
          catalogById.get('alfin')?.src,
          '/imgs_webp/logo-alfin.webp'
        );
        assert.equal(
          catalogById.get('certus')?.src,
          '/imgs_webp/logo-certus.webp'
        );
        assert.equal(
          catalogById.get('directv')?.src,
          '/imgs_webp/logo-directv.webp'
        );
        assert.equal(
          catalogById.get('maf')?.src,
          '/imgs_webp/logo-maf.webp'
        );
        assert.equal(
          catalogById.get('niubiz')?.src,
          '/imgs_webp/logo-niubiz.webp'
        );
        assert.equal(
          catalogById.get('oriflame')?.src,
          '/imgs_webp/logo-oriflame.webp'
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
