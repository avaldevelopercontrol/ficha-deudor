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
  UsuarioGrupoOpcionListado,
} from '../../../types/usuarioGrupoOpcion.types';

import {
  useMantenerAccesosUsuarioColumns,
} from './useMantenerAccesosUsuarioColumns';

const row: UsuarioGrupoOpcionListado = {
  idUsuarioGrupoOpcion: 1,
  idUsuario: 14931,
  usuario: '14931',
  nombreCompleto:
    'Luis Pierre Martinez Zapana',
  idGrupo: 22,
  grupo: 'BACKUS',
  idOpcion: 10,
  codigoOpcion: 'mMantenerPerfil',
  opcion: 'Mantener perfil',
  consultar: true,
  insertar: false,
  editar: false,
  eliminar: false,
  exportar: false,
  estado: 'Activo',
};

const ColumnsTable = ({
  editEnabled,
}: {
  editEnabled: boolean;
}) => {
  const columns =
    useMantenerAccesosUsuarioColumns({
      onEditAcceso: editEnabled
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
  'columnas de accesos por usuario',
  [
    test(
      'muestra las siete columnas solicitadas y sus datos',
      () => {
        const html =
          renderToStaticMarkup(
            <ColumnsTable
              editEnabled
            />
          );

        assert.match(html, />Id</);
        assert.match(html, />Usuario</);
        assert.match(
          html,
          /Nombre completo/
        );
        assert.match(html, />Grupo</);
        assert.match(html, />Opción</);
        assert.match(html, />Estado</);
        assert.match(html, />Editar</);
        assert.doesNotMatch(html, />Documento</);
        assert.match(html, /width:9%/);
        assert.match(html, /width:7%/);
        assert.match(
          html,
          /Luis Pierre Martinez Zapana/
        );
        assert.match(html, /BACKUS/);
        assert.match(
          html,
          /Mantener perfil/
        );
        assert.match(html, /ACTIVO/);
      }
    ),
    test(
      'mantiene visible pero deshabilitada la edición cuando no recibe una acción',
      () => {
        const html =
          renderToStaticMarkup(
            <ColumnsTable
              editEnabled={false}
            />
          );

        assert.match(
          html,
          /disabled=""/
        );
        assert.match(
          html,
          /Editar accesos del usuario/
        );
      }
    ),
  ]
);
