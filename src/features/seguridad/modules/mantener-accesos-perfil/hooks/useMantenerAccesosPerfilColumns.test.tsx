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
};

const ColumnsTable = ({
  enabled,
}: {
  enabled: boolean;
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
      data={[row]}
      allData={[row]}
      fitToPanel
    />
  );
};

export const suite = defineSuite(
  'columnas de accesos por perfil',
  [
    test(
      'muestra las cuatro columnas solicitadas y los datos normalizados',
      () => {
        const html =
          renderToStaticMarkup(
            <ColumnsTable
              enabled
            />
          );

        assert.match(html, />Id</);
        assert.match(html, />Nombre</);
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
