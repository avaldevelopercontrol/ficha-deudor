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
  Perfil,
} from '../../../types/perfil.types';

import {
  useMantenerPerfilColumns,
} from './useMantenerPerfilColumns';

const row: Perfil = {
  idPerfil: 7,
  nombrePerfil: 'Supervisor',
  abreviatura: 'SUP',
  fechaRegistro: '01/09/2026',
  estado: 'Activo',
  produccionOnline: 'Sí',
  historiaDeudor: 'No',
};

const ColumnsTable = ({
  enabled,
}: {
  enabled: boolean;
}) => {
  const columns = useMantenerPerfilColumns({
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
  'columnas de mantener perfil',
  [
    test(
      'mantiene las columnas y badges funcionales del mantenimiento',
      () => {
        const html = renderToStaticMarkup(
          <ColumnsTable enabled />
        );

        assert.match(html, />Id</);
        assert.match(html, /Nombre del Perfil/);
        assert.match(html, /Abreviatura/);
        assert.match(html, /Fecha Registro/);
        assert.match(html, />Estado</);
        assert.match(html, /Producción Online/);
        assert.match(html, /Historia Deudor/);
        assert.match(html, />Editar</);
        assert.match(html, /Supervisor/);
        assert.match(html, /ACTIVO/);
        assert.match(html, />SÍ</);
        assert.match(html, />NO</);
      }
    ),
    test(
      'mantiene visible la acción de edición cuando no recibe callback',
      () => {
        const html = renderToStaticMarkup(
          <ColumnsTable enabled={false} />
        );

        assert.match(
          html,
          /aria-label="Editar perfil: Supervisor"/
        );
        assert.match(
          html,
          /title="Editar perfil"/
        );
      }
    ),
  ]
);
