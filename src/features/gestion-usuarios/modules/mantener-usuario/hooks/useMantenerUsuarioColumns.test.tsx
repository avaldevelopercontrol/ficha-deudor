import assert from 'node:assert/strict';

import {
  renderToStaticMarkup,
} from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  UsuarioMantenible,
} from '../types/mantenerUsuario.types';

import {
  useMantenerUsuarioColumns,
} from './useMantenerUsuarioColumns';

const usuario: UsuarioMantenible = {
  id: 20,
  nombre: 'Usuario de prueba',
  estado: 'Activo',
  perfil: 'Administrador',
  codigoRecaudacion: 'USR-20',
  login: 'usuario.prueba',
};

const EditColumnProbe = () => {
  const columns =
    useMantenerUsuarioColumns();

  const editColumn = columns.find(
    (column) => column.key === 'editar'
  );

  return <>{editColumn?.render?.(usuario)}</>;
};

export const suite = defineSuite(
  'columnas de Mantener usuario',
  [
    test(
      'mantiene disponible la acción Editar para consultar el usuario aunque el guardado dependa del permiso EDITAR',
      () => {
        const html =
          renderToStaticMarkup(
            <EditColumnProbe />
          );

        assert.match(
          html,
          /aria-label="Editar: Usuario de prueba"/
        );

        assert.doesNotMatch(
          html,
          /disabled=""/
        );
      }
    ),
  ]
);
