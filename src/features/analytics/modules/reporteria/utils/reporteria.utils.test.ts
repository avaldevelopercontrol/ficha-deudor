import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  PowerBiReport,
} from '../domain/reporteria.types';

import {
  buildPowerBiReportAccessKey,
  filterPowerBiReports,
  filterPowerBiReportsBySelection,
  findPowerBiReportById,
  getAvailablePowerBiReports,
  retainAvailablePowerBiReportIds,
  resolvePowerBiEmbedUrl,
  resolvePowerBiPublishToWebUrl,
  resolveReportImageSource,
} from './reporteria.utils';

const buildReport = (
  overrides: Partial<PowerBiReport>
): PowerBiReport => ({
  id: 26,
  code: 'mBackusCobranza',
  name: 'Backus Cobranza',
  description: 'Seguimiento de cobranza.',
  serviceUrl: 'https://app.powerbi.com/view?r=demo',
  image: '/logos/backus.webp',
  email: 'ngutierrez@avalperu.com',
  icon: 'analytics',
  ...overrides,
});

const report = buildReport({});

export const suite = defineSuite(
  'reporteria.utils',
  [
    test(
      'expone solo reportes con una URL Power BI de servicio válida',
      () => {
        assert.deepEqual(
          getAvailablePowerBiReports([
            report,
            buildReport({
              id: 27,
              serviceUrl: null,
            }),
            buildReport({
              id: 28,
              serviceUrl: 'https://example.com/view?r=demo',
            }),
          ]).map((item) => item.id),
          [26]
        );
      }
    ),
    test(
      'construye una key de acceso estable aunque cambie el orden del catálogo',
      () => {
        const anotherReport = buildReport({
          id: 30,
          name: 'Otro reporte',
        });

        assert.equal(
          buildPowerBiReportAccessKey([
            anotherReport,
            report,
          ]),
          '26,30'
        );
        assert.equal(
          buildPowerBiReportAccessKey([
            report,
            anotherReport,
          ]),
          '26,30'
        );
      }
    ),
    test(
      'descarta selecciones que ya no están disponibles y filtra el catálogo efectivo',
      () => {
        const anotherReport = buildReport({
          id: 30,
          name: 'Otro reporte',
        });
        const reports = [report, anotherReport];

        assert.deepEqual(
          retainAvailablePowerBiReportIds(
            reports,
            [30, 999]
          ),
          [30]
        );
        assert.deepEqual(
          filterPowerBiReportsBySelection(
            reports,
            [30]
          ).map((item) => item.id),
          [30]
        );
        assert.deepEqual(
          filterPowerBiReportsBySelection(
            reports,
            []
          ).map((item) => item.id),
          [26, 30]
        );
      }
    ),
    test(
      'busca reportes por nombre o descripción',
      () => {
        assert.equal(
          filterPowerBiReports(
            [report],
            'cobranza'
          ).length,
          1
        );
        assert.equal(
          filterPowerBiReports(
            [report],
            'inexistente'
          ).length,
          0
        );
      }
    ),
    test(
      'resuelve reportes por Id y rechaza esquemas de URL inseguros',
      () => {
        assert.equal(
          findPowerBiReportById(
            [report],
            26
          )?.name,
          'Backus Cobranza'
        );
        assert.equal(
          resolvePowerBiEmbedUrl(
            'javascript:alert(1)'
          ),
          null
        );
        assert.match(
          resolvePowerBiEmbedUrl(
            'https://app.powerbi.com/view?r=demo'
          ) ?? '',
          /^https:\/\/app\.powerbi\.com\//
        );
        assert.equal(
          resolvePowerBiEmbedUrl(
            'https://example.com/view?r=demo'
          ),
          null
        );
        assert.equal(
          resolvePowerBiEmbedUrl(
            'http://app.powerbi.com/view?r=demo'
          ),
          null
        );
        assert.equal(
          resolvePowerBiEmbedUrl(
            'https://user:secret@app.powerbi.com/view?r=demo'
          ),
          null
        );
        assert.match(
          resolvePowerBiPublishToWebUrl(
            'https://app.powerbi.com/view?r=demo'
          ) ?? '',
          /^https:\/\/app\.powerbi\.com\/view/
        );
        assert.equal(
          resolvePowerBiPublishToWebUrl(
            'https://app.powerbi.com/reportEmbed?reportId=demo'
          ),
          null
        );
        assert.equal(
          resolvePowerBiPublishToWebUrl(
            'https://example.com/view?r=demo'
          ),
          null
        );
        assert.equal(
          resolvePowerBiPublishToWebUrl(
            'https://app.powerbi.com/view?r=demo&r=other'
          ),
          null
        );
        assert.equal(
          resolvePowerBiPublishToWebUrl(
            'https://app.powerbi.com/view?r=demo#section'
          ),
          null
        );
        assert.equal(
          resolveReportImageSource('/logos/backus.webp'),
          '/logos/backus.webp'
        );
        assert.equal(
          resolveReportImageSource('javascript:alert(1)'),
          null
        );
      }
    ),
  ]
);
