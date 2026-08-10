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
  Grupo,
} from '../../../types/grupo.types';

import {
  useMantenerGrupoColumns,
} from './useMantenerGrupoColumns';

const row: Grupo = {
  idGrupo: 219,
  nombreGrupo:
    'ADEX INSTITUTO',
  cliente:
    'ADEX INSTITUTO',
  estado: 'Activo',
};

const ColumnsTable = ({
  enabled,
}: {
  enabled: boolean;
}) => {
  const columns =
    useMantenerGrupoColumns({
      onEditGrupo: enabled
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
  'columnas de mantener grupo',
  [
    test(
      'muestra las cinco columnas solicitadas',
      () => {
        const html =
          renderToStaticMarkup(
            <ColumnsTable
              enabled
            />
          );

        assert.match(html, />Id</);
        assert.match(
          html,
          /Nombre del Grupo/
        );
        assert.match(
          html,
          />Cliente</
        );
        assert.match(
          html,
          />Estado</
        );
        assert.match(
          html,
          />Editar</
        );
        assert.match(
          html,
          /ADEX INSTITUTO/
        );
        assert.match(
          html,
          /ACTIVO/
        );
      }
    ),
    test(
      'mantiene la edición visible y deshabilitada cuando no recibe una acción',
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
          /edición del grupo no está disponible/
        );
      }
    ),
  ]
);
