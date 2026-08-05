import assert from 'node:assert/strict';

import {
  renderToStaticMarkup,
} from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  Modulo,
} from '../../../types/opcion.types';

import ModuloFormFields from './ModuloFormFields';

const root: Modulo = {
  idModulo: 1,
  nombre: 'Root',
  descripcion: '',
  codigo: 'Root',
  ruta: 'root/',
  icono: '',
  tipo: 1,
  idPadre: 0,
  codigoPadre: '',
  padre: '',
  orden: 0,
  visibleActivo: true,
  visible: 'Sí',
  estadoActivo: true,
  estado: 'Activo',
};

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
                icono: '',
                padreId: 1,
                visible: false,
                estado: false,
              }}
              errors={{}}
              modulos={[root]}
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
      }
    ),
  ]
);
