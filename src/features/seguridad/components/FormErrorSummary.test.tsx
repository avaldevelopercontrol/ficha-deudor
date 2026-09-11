import assert from 'node:assert/strict';

import {
  renderToStaticMarkup,
} from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import FormErrorSummary from './FormErrorSummary';

export const suite = defineSuite(
  'FormErrorSummary',
  [
    test(
      'no renderiza contenido cuando no existen errores',
      () => {
        const html = renderToStaticMarkup(
          <FormErrorSummary
            errors={{}}
            title="Revise los datos"
          />
        );

        assert.equal(html, '');
      }
    ),
    test(
      'mantiene el mismo markup y clases usados por los formularios de seguridad',
      () => {
        const html = renderToStaticMarkup(
          <FormErrorSummary
            errors={{
              nombre: 'El nombre es obligatorio.',
              estado: 'El estado no es válido.',
            }}
            title="Revise los datos"
          />
        );

        assert.match(
          html,
          /class="error-summary"/
        );
        assert.match(html, /role="alert"/);
        assert.match(html, /Revise los datos/);
        assert.match(
          html,
          /El nombre es obligatorio\./
        );
        assert.match(
          html,
          /El estado no es válido\./
        );
      }
    ),
  ]
);
