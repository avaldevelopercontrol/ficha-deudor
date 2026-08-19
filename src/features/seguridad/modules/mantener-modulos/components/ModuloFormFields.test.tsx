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
            esPowerBI: false,
            urlBI: '',
            imagenOpcion: '',
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
          onEsPowerBIChange: () => undefined,
          onUrlBIChange: () => undefined,
          onImagenOpcionChange: () => undefined,
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
                esPowerBI: false,
                urlBI: '',
                imagenOpcion: '',
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
              onEsPowerBIChange={() => undefined}
              onUrlBIChange={() => undefined}
              onImagenOpcionChange={() => undefined}
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
    test(
      'muestra URL y selector de logo para Power BI, oculta icono y mantiene código editable',
      () => {
        const html = renderToStaticMarkup(
          <ModuloFormFields
            form={{
              nombre: 'Backus Cobranza',
              descripcion: '',
              codigo: 'mBackusCobranza',
              icono: 'analytics',
              esPowerBI: true,
              urlBI: 'https://app.powerbi.com/view?r=demo',
              imagenOpcion: '/imgs_webp/logo-backus.webp',
              emailOpcion: 'ngutierrez@avalperu.com',
              padreId: 25,
              visible: true,
              estado: true,
            }}
            errors={{}}
            parentOptions={[{ id: 25, label: 'Reportería' }]}
            parentDisabled
            onNombreChange={() => undefined}
            onDescripcionChange={() => undefined}
            onCodigoChange={() => undefined}
            onIconoChange={() => undefined}
            onEsPowerBIChange={() => undefined}
            onUrlBIChange={() => undefined}
            onImagenOpcionChange={() => undefined}
            onPadreChange={() => undefined}
            onVisibleChange={() => undefined}
            onEstadoChange={() => undefined}
          />
        );

        assert.match(html, /Tipo de módulo/);
        assert.match(html, /Tablero Power BI/);
        assert.match(html, /id="modulo-url-bi"/);
        assert.match(html, /id="modulo-imagen-opcion"/);
        assert.doesNotMatch(
          html,
          /id="modulo-codigo"[^>]*disabled=""/
        );
        assert.match(
          html,
          /BACKUS COBRANZA/
        );
        assert.match(
          html,
          /<img[^>]*src="\/imgs_webp\/logo-backus\.webp"/
        );
        assert.doesNotMatch(
          html,
          /id="modulo-icono"/
        );
      }
    ),
    test(
      'oculta el selector de tipo en edición y conserva los campos del Power BI existente',
      () => {
        const html = renderToStaticMarkup(
          <ModuloFormFields
            form={{
              nombre: 'Americatel',
              descripcion: '',
              codigo: 'mAmericatel',
              icono: 'analytics',
              esPowerBI: true,
              urlBI: 'https://app.powerbi.com/view?r=demo',
              imagenOpcion: '/imgs_webp/logo-entel.webp',
              emailOpcion: 'mparipanca@avalperu.com',
              padreId: 25,
              visible: true,
              estado: true,
            }}
            errors={{}}
            parentOptions={[{ id: 25, label: 'Reportería' }]}
            parentDisabled
            codeDisabled
            showPowerBiTypeSelector={false}
            onNombreChange={() => undefined}
            onDescripcionChange={() => undefined}
            onCodigoChange={() => undefined}
            onIconoChange={() => undefined}
            onUrlBIChange={() => undefined}
            onImagenOpcionChange={() => undefined}
            onPadreChange={() => undefined}
            onVisibleChange={() => undefined}
            onEstadoChange={() => undefined}
          />
        );

        assert.doesNotMatch(
          html,
          /Tipo de módulo/
        );
        assert.doesNotMatch(
          html,
          /Tablero Power BI/
        );
        assert.match(
          html,
          /id="modulo-url-bi"/
        );
        assert.match(
          html,
          /id="modulo-imagen-opcion"/
        );
        assert.doesNotMatch(
          html,
          /id="modulo-icono"/
        );
      }
    ),

  ]
);
