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
  useMantenerModulosColumns,
} from './useMantenerModulosColumns';

const row: Modulo = {
  idModulo: 6,
  nombre: 'Mantener perfil',
  descripcion: '',
  codigo: 'mMantenerPerfil',
  ruta: 'root/mSeguridad/mMantenerPerfil/',
  icono: '',
  tipo: 3,
  idPadre: 2,
  codigoPadre: 'mSeguridad',
  padre: 'Seguridad',
  orden: 1,
  visibleActivo: true,
  visible: 'Sí',
  estadoActivo: true,
  estado: 'Activo',
};

const ColumnsTable = () => {
  const columns =
    useMantenerModulosColumns();

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
  'columnas de mantener módulos',
  [
    test(
      'muestra el listado sin la columna código',
      () => {
        const html =
          renderToStaticMarkup(
            <ColumnsTable />
          );

        assert.doesNotMatch(
          html,
          />Código</
        );
        assert.match(html, />Id</);
        assert.match(html, />Nombre</);
        assert.match(html, />Ruta</);
        assert.match(html, />Padre</);
        assert.match(html, />Nivel</);
        assert.match(html, />Visible</);
        assert.match(html, />Estado</);
        assert.match(html, />Editar</);
      }
    ),
  ]
);
