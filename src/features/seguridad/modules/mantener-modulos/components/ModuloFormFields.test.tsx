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
      'permite bloquear nombre y código de forma independiente',
      () => {
        const baseProps = {
          form: {
            nombre: 'Mantener Grupo',
            descripcion:
              'Consulta los grupos registrados.',
            codigo: 'mMantenerGrupo',
            icono: 'groups',
            padreId: 1,
            visible: true,
            estado: true,
          },
          errors: {},
          parentOptions: [
            {
              id: 1,
              label: 'Seguridad',
            },
          ],
          onNombreChange: () => undefined,
          onDescripcionChange: () => undefined,
          onCodigoChange: () => undefined,
          onIconoChange: () => undefined,
          onPadreChange: () => undefined,
          onVisibleChange: () => undefined,
          onEstadoChange: () => undefined,
        };

        const editHtml =
          renderToStaticMarkup(
            <ModuloFormFields
              {...baseProps}
              codeDisabled
            />
          );

        assert.doesNotMatch(
          editHtml,
          /id="modulo-nombre"[^>]*disabled=""/
        );
        assert.match(
          editHtml,
          /id="modulo-codigo"[^>]*disabled=""/
        );

        const registerHtml =
          renderToStaticMarkup(
            <ModuloFormFields
              {...baseProps}
              nameDisabled
              codeDisabled
            />
          );

        assert.match(
          registerHtml,
          /id="modulo-nombre"[^>]*disabled=""/
        );
        assert.match(
          registerHtml,
          /id="modulo-codigo"[^>]*disabled=""/
        );
      }
    ),
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
