import assert from 'node:assert/strict';

import { renderToStaticMarkup } from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import {
  AnalyticsSearchableSelect,
} from './AnalyticsSearchableSelect';
import {
  filterAnalyticsSearchableOptions,
} from './analyticsSearchableSelect.utils';

const OPTIONS = [
  { id: 10, label: 'América Telecom' },
  { id: 20, label: 'Backus Cobranza' },
  { id: 30, label: 'Cliente General' },
] as const;

export const suite = defineSuite(
  'AnalyticsSearchableSelect',
  [
    test(
      'filtra opciones ignorando mayúsculas y tildes',
      () => {
        const result = filterAnalyticsSearchableOptions(
          OPTIONS,
          'america'
        );

        assert.deepEqual(
          result.map((option) => option.id),
          [10]
        );
      }
    ),
    test(
      'muestra el valor seleccionado como disparador',
      () => {
        const html = renderToStaticMarkup(
          <AnalyticsSearchableSelect
            id="report-filter"
            label="Reporte BI"
            options={OPTIONS}
            value={20}
            placeholder="Todos los reportes"
            searchPlaceholder="Buscar reporte..."
            onChange={() => undefined}
          />
        );

        assert.match(html, />Backus Cobranza</);
        assert.match(html, /aria-haspopup="listbox"/);
      }
    ),
    test(
      'mantiene el motivo accesible cuando el filtro está deshabilitado',
      () => {
        const html = renderToStaticMarkup(
          <AnalyticsSearchableSelect
            id="client-filter"
            label="Cliente"
            options={[]}
            value={null}
            placeholder="No aplica para este reporte"
            searchPlaceholder="Buscar cliente..."
            disabled
            disabledReason="Este BI no utiliza contexto de cliente."
            onChange={() => undefined}
          />
        );

        assert.match(html, /disabled=""/);
        assert.match(html, />No aplica para este reporte</);
        assert.match(
          html,
          />Este BI no utiliza contexto de cliente\.</
        );
      }
    ),
  ]
);
