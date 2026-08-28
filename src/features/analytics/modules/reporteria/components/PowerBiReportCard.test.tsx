import assert from 'node:assert/strict';

import {
  renderToStaticMarkup,
} from 'react-dom/server';

import type {
  AuthorizedOption,
} from '@features/access-control';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  PowerBiReportCard,
} from './PowerBiReportCard';

const report: AuthorizedOption = {
  id: 26,
  code: 'mAmericatel',
  name: 'AMERICATEL',
  description: 'Reporte de prueba.',
  urlBI: 'https://app.powerbi.com/view?r=demo',
  image: '/imgs_webp/logo-entel.webp',
  email: 'mparipanca@avalperu.com',
  icon: 'analytics',
  type: 4,
  parentId: 25,
  order: 1,
  route: null,
  permissions: {
    consultar: true,
    insertar: false,
    editar: false,
    eliminar: false,
    exportar: false,
  },
  children: [],
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
