import assert from 'node:assert/strict';

import {
  renderToStaticMarkup,
} from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  PowerBiReport,
} from '../domain/reporteria.types';

import {
  PowerBiReportCard,
} from './PowerBiReportCard';

const report: PowerBiReport = {
  id: 26,
  code: 'mAmericatel',
  name: 'AMERICATEL',
  description: 'Reporte de prueba.',
  serviceUrl: 'https://app.powerbi.com/view?r=demo',
  image: '/imgs_webp/logo-entel.webp',
  email: 'mparipanca@avalperu.com',
  icon: 'analytics',
};

export const suite = defineSuite(
  'PowerBiReportCard',
  [
    test(
      'muestra Ingresar, Email y Disponible en el pie de la tarjeta',
      () => {
        const html = renderToStaticMarkup(
          <PowerBiReportCard
            report={report}
            onOpen={() => undefined}
          />
        );

        assert.match(html, />Ingresar</);
        assert.match(html, />Email</);
        assert.match(html, />Disponible</);
        assert.match(
          html,
          /mailto:mparipanca@avalperu\.com/
        );
      }
    ),
    test(
      'deshabilita Email si la API devuelve un correo inválido',
      () => {
        const html = renderToStaticMarkup(
          <PowerBiReportCard
            report={{
              ...report,
              email: 'correo-invalido',
            }}
            onOpen={() => undefined}
          />
        );

        assert.doesNotMatch(
          html,
          /mailto:/
        );
        assert.match(
          html,
          /Correo pendiente de configurar/
        );
      }
    ),
  ]
);
