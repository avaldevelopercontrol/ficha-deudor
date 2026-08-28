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
  PowerBiReportFilter,
} from './PowerBiReportFilter';

const buildReport = (
  id: number,
  name: string
): AuthorizedOption => ({
  id,
  code: `m${name}`,
  name,
  description: '',
  urlBI: 'https://app.powerbi.com/view?r=demo',
  image: null,
  email: 'reportes@avalperu.com',
  icon: 'analytics',
  type: 4,
  parentId: 25,
  order: id,
  route: null,
  permissions: {
    consultar: true,
    insertar: false,
    editar: false,
    eliminar: false,
    exportar: false,
  },
  children: [],
});

const reports = [
  buildReport(26, 'AMERICATEL'),
  buildReport(27, 'BACKUS COBRANZA'),
];

export const suite = defineSuite(
  'PowerBiReportFilter',
  [
    test(
      'muestra Todos los reportes y el total cuando no existe selección',
      () => {
        const html = renderToStaticMarkup(
          <PowerBiReportFilter
            reports={reports}
            selectedReportIds={[]}
            filteredResults={2}
            onChange={() => undefined}
          />
        );

        assert.match(
          html,
          /Filtrar reportes/i
        );
        assert.match(
          html,
          />Todos los reportes</
        );
        assert.match(html, />2 reportes</);
      }
    ),
    test(
      'muestra el nombre del único reporte seleccionado',
      () => {
        const html = renderToStaticMarkup(
          <PowerBiReportFilter
            reports={reports}
            selectedReportIds={[26]}
            filteredResults={1}
            onChange={() => undefined}
          />
        );

        assert.match(html, />AMERICATEL</);
        assert.match(
          html,
          />1 de 2 reportes</
        );
      }
    ),
  ]
);
