import assert from 'node:assert/strict';

import {
  renderToStaticMarkup,
} from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import ModuloFormFields from './ModuloFormFields';

export const suite = defineSuite(
  'campos de mantener módulo',
  [
    test(
      'deshabilita visible cuando el estado es inactivo',
      () => {
        const html =
          renderToStaticMarkup(
            <ModuloFormFields
              form={{
                nombre: 'Módulo',
                descripcion:
                  'Descripción del módulo',
                codigo: 'mModulo',
                icono: 'database-upload',
                padreId: 1,
                visible: false,
                estado: false,
              }}
              errors={{}}
              parentOptions={[
                {
                  id: 1,
                  label: 'Root',
                },
              ]}
              visibleDisabled
              onNombreChange={() => undefined}
              onDescripcionChange={() => undefined}
              onCodigoChange={() => undefined}
              onIconoChange={() => undefined}
              onPadreChange={() => undefined}
              onVisibleChange={() => undefined}
              onEstadoChange={() => undefined}
            />
          );

        assert.match(
          html,
          /Visible[\s\S]*?<select[^>]*disabled=""/
        );
        assert.match(
          html,
          /<option value="false" selected="">No<\/option>/
        );
        assert.match(
          html,
          /Descripción[\s\S]*?<textarea[^>]*>Descripción del módulo<\/textarea>/
        );
        assert.match(
          html,
          /Carga de base/
        );
        assert.match(
          html,
          /aria-haspopup="listbox"/
        );
      }
    ),
  ]
);
