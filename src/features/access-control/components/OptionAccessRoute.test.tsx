import assert from 'node:assert/strict';

import {
  renderToStaticMarkup,
} from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  EMPTY_ACCESS_PERMISSIONS,
} from '../utils/accessControl.utils';

import {
  AccessControlContext,
} from '../contexts/accessControlContextValue';

import type {
  AccessControlContextValue,
  AccessControlStatus,
} from '../types/accessControl.types';

import {
  OptionAccessRoute,
} from './OptionAccessRoute';

const OPTION_ID = 12;

const createContextValue = ({
  status,
  canConsult,
}: {
  status: AccessControlStatus;
  canConsult: boolean;
}): AccessControlContextValue => ({
  status,
  error: null,
  menuTree: [],
  navigationTree: [],
  refresh: async () => {
    await Promise.resolve();
  },
  hasOption: (optionId) =>
    optionId === OPTION_ID,
  hasPermission: (
    optionId,
    permission
  ) =>
    optionId === OPTION_ID &&
    permission === 'consultar' &&
    canConsult,
  getPermissions: () => ({
    ...EMPTY_ACCESS_PERMISSIONS,
    consultar: canConsult,
  }),
});

const renderRoute = (
  status: AccessControlStatus,
  canConsult: boolean
) =>
  renderToStaticMarkup(
    <AccessControlContext.Provider
      value={createContextValue({
        status,
        canConsult,
      })}
    >
      <OptionAccessRoute
        optionId={OPTION_ID}
      >
        <div>Contenido protegido</div>
      </OptionAccessRoute>
    </AccessControlContext.Provider>
  );

export const suite = defineSuite(
  'OptionAccessRoute',
  [
    test(
      'mantiene montada la pantalla durante un refresh cuando existe permiso vigente de consulta',
      () => {
        const html = renderRoute(
          'loading',
          true
        );

        assert.match(
          html,
          /Contenido protegido/
        );
        assert.doesNotMatch(
          html,
          /Cargando accesos/
        );
      }
    ),

    test(
      'muestra la carga inicial cuando todavía no existe un permiso vigente',
      () => {
        const html = renderRoute(
          'loading',
          false
        );

        assert.match(
          html,
          /Cargando accesos/
        );
        assert.doesNotMatch(
          html,
          /Contenido protegido/
        );
      }
    ),
  ]
);
