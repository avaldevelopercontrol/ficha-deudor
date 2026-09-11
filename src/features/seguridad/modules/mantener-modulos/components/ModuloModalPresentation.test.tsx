import assert from 'node:assert/strict';
import {
  renderToStaticMarkup,
} from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  ModuloFormData,
} from '../types/registrarModulo.types';

import ModuloModalFormBody from './ModuloModalFormBody';
import ModuloModalSubmitFooter from './ModuloModalSubmitFooter';

const form: ModuloFormData = {
  nombre: 'Seguridad',
  descripcion: 'Administración',
  codigo: 'mSeguridad',
  icono: 'shield',
  esPowerBI: false,
  urlBI: '',
  imagenOpcion: '',
  emailOpcion: '',
  padreId: 1,
  visible: true,
  estado: true,
};

const noop = () => undefined;

export const suite = defineSuite(
  'presentación compartida del modal de módulos',
  [
    test(
      'mantiene el body, contenido adicional y resumen de errores',
      () => {
        const html = renderToStaticMarkup(
          <ModuloModalFormBody
            formFieldsProps={{
              form,
              errors: {
                nombre: 'Nombre inválido',
              },
              parentOptions: [
                {
                  id: 1,
                  label: 'Root',
                },
              ],
              onNombreChange: noop,
              onDescripcionChange: noop,
              onCodigoChange: noop,
              onIconoChange: noop,
              onUrlBIChange: noop,
              onImagenOpcionChange: noop,
              onPadreChange: noop,
              onVisibleChange: noop,
              onEstadoChange: noop,
            }}
            validationTitle="Revise los datos"
            submitError="No se pudo guardar"
          >
            <div>Configuración adicional</div>
          </ModuloModalFormBody>
        );

        assert.match(
          html,
          /registrar-modulo-modal__body/
        );
        assert.match(
          html,
          /Configuración adicional/
        );
        assert.match(html, /Revise los datos/);
        assert.match(html, /Nombre inválido/);
        assert.match(html, /No se pudo guardar/);
      }
    ),
    test(
      'mantiene el footer y la semántica del botón de guardado',
      () => {
        const html = renderToStaticMarkup(
          <ModuloModalSubmitFooter
            label="Guardar"
            loadingLabel="Guardando..."
            loading={false}
            disabled
            title="Sin permiso"
            onSubmit={noop}
          />
        );

        assert.match(
          html,
          /registrar-modulo-modal__footer/
        );
        assert.match(
          html,
          /registrar-modulo-modal__submit-button/
        );
        assert.match(html, /disabled=""/);
        assert.match(html, /title="Sin permiso"/);
        assert.match(html, /Guardar/);
      }
    ),
  ]
);
