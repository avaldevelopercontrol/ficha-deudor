import assert from 'node:assert/strict';

import {
  renderToStaticMarkup,
} from 'react-dom/server';

import Table from '@shared/components/table/Table';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  useMantenerAccesosPerfilColumns,
} from './useMantenerAccesosPerfilColumns';

const row = {
  idPerfil: 9,
  nombrePerfil:
    'Administrador Base Datos',
  cantidadOpciones: 3,
  estadoActivo: true,
};

const ColumnsTable = ({
  enabled,
  estadoActivo = true,
}: {
  enabled: boolean;
  estadoActivo?: boolean;
}) => {
  const columns =
    useMantenerAccesosPerfilColumns({
      onEditPerfil: enabled
        ? () => undefined
        : undefined,
    });

  return (
    <Table
      columns={columns}
      data={[{ ...row, estadoActivo }]}
      allData={[{ ...row, estadoActivo }]}
      fitToPanel
    />
  );
};

export const suite = defineSuite(
  'columnas de accesos por perfil',
  [
    test(
      'muestra las columnas del perfil incluyendo su estado',
      () => {
        const html =
          renderToStaticMarkup(
            <ColumnsTable
              enabled
            />
          );

        assert.match(html, />Id</);
        assert.match(html, />Nombre</);
        assert.match(html, />Estado</);
        assert.match(html, /ACTIVO/);
        assert.match(
          html,
          /background-color:#dcfce7/
        );
        assert.match(
          html,
          /Cantidad Opciones/
        );
        assert.match(html, />Editar</);
        assert.match(
          html,
          /Administrador Base Datos/
        );
        assert.match(html, />3</);
      }
    ),
    test(
      'muestra el estado inactivo con el mismo badge neutral de seguridad',
      () => {
        const html =
          renderToStaticMarkup(
            <ColumnsTable
              enabled
              estadoActivo={false}
            />
          );

        assert.match(html, /INACTIVO/);
        assert.match(
          html,
          /background-color:#f3f4f6/
        );
      }
    ),
    test(
      'mantiene visible pero deshabilitada la edición hasta contar con sus APIs',
      () => {
        const html =
          renderToStaticMarkup(
            <ColumnsTable
              enabled={false}
            />
          );

        assert.match(
          html,
          /disabled=""/
        );
        assert.match(
          html,
          /API de detalle y actualización/
        );
      }
    ),
  ]
);
