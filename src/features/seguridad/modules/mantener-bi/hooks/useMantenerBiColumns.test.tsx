import assert from 'node:assert/strict';

import {
  renderToStaticMarkup,
} from 'react-dom/server';

import Table from '@shared/components/table/Table';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  Modulo,
} from '../../../types/opcion.types';

import {
  useMantenerBiColumns,
} from './useMantenerBiColumns';

const biRow: Modulo = {
  idModulo: 60,
  nombre: 'Cartera ejecutiva',
  descripcion: '',
  codigo: 'biCarteraEjecutiva',
  ruta: '',
  urlBI:
    'https://app.powerbi.com/view?r=abc123',
  imagenOpcion: null,
  icono: 'analytics',
  tipo: 4,
  idPadre: 25,
  codigoPadre: 'mReporteria',
  padre: 'Reportería',
  orden: 1,
  visibleActivo: true,
  visible: 'Sí',
  estadoActivo: true,
  estado: 'Activo',
  implementacion: 'POWER BI',
};

const ColumnsTable = ({
  editable = false,
}: {
  editable?: boolean;
}) => {
  const columns =
    useMantenerBiColumns({
      onEditBi: editable
        ? () => undefined
        : undefined,
    });

  return (
    <Table
      columns={columns}
      data={[biRow]}
      allData={[biRow]}
      enableColumnFilters
      fitToPanel
    />
  );
};

export const suite = defineSuite(
  'columnas de mantener BI',
  [
    test(
      'muestra únicamente las columnas solicitadas para el catálogo BI',
      () => {
        const html =
          renderToStaticMarkup(
            <ColumnsTable />
          );

        assert.match(html, />Id</);
        assert.match(html, />Nombre</);
        assert.match(
          html,
          />Implementación</
        );
        assert.match(html, />Visible</);
        assert.match(html, />Estado</);
        assert.match(html, />Editar</);

        assert.doesNotMatch(
          html,
          />Padre</
        );
        assert.doesNotMatch(
          html,
          />Nivel</
        );
      }
    ),
    test(
      'mantiene la edición visible pero deshabilitada cuando no existe un manejador',
      () => {
        const html =
          renderToStaticMarkup(
            <ColumnsTable />
          );

        assert.match(
          html,
          /aria-label="Editar BI: Cartera ejecutiva"/
        );
        assert.match(
          html,
          /disabled=""/
        );
        assert.match(
          html,
          /POWER BI/
        );
      }
    ),
    test(
      'habilita la acción Editar BI cuando la tabla recibe el manejador de edición',
      () => {
        const html =
          renderToStaticMarkup(
            <ColumnsTable editable />
          );

        assert.match(
          html,
          /aria-label="Editar BI: Cartera ejecutiva"/
        );
        assert.doesNotMatch(
          html,
          /disabled=""/
        );
      }
    ),
  ]
);
