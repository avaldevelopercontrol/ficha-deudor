import assert from 'node:assert/strict';

import {
  renderToStaticMarkup,
} from 'react-dom/server';

import {
  MemoryRouter,
} from 'react-router-dom';

import {
  AuthContext,
} from '@features/auth/contexts/authContextValue';

import type {
  AuthContextValue,
} from '@features/auth/types';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  AppHeader,
} from './AppHeader';

const authValue: AuthContextValue = {
  isAuthenticated: true,
  usuario: {
    id_usuario: '16068',
    nombre: 'Junior',
    apellido: 'Perez',
    username: '16068',
    email: '',
    perfil: 'Administrador',
    perfilId: 1,
  },
  clienteSeleccionada: {
    id_cliente: '1',
    nombre: 'CLARO CORPORATIVO',
    codigo: 'CLARO',
    activa: true,
  },
  isLoading: false,
  error: null,
  expiredPasswordChallenge: null,
  passwordExpiryWarning: null,
  login: async () => ({
    success: true,
    code: '00',
    message: 'OK',
    usuario: null,
  }),
  logout: () => undefined,
  seleccionarCliente: () => undefined,
  clearError: () => undefined,
  clearExpiredPasswordChallenge: () => undefined,
  clearPasswordExpiryWarning: () => undefined,
};

const renderHeader = (
  showLogoutButton: boolean
): string =>
  renderToStaticMarkup(
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>
        <AppHeader
          breadcrumb="MENÚ DE MÓDULOS"
          showLogoutButton={showLogoutButton}
        />
      </AuthContext.Provider>
    </MemoryRouter>
  );

export const suite = defineSuite(
  'AppHeader',
  [
    test(
      'muestra Cerrar sesión con texto en vistas sin sidebar',
      () => {
        const html = renderHeader(true);

        assert.match(
          html,
          />Cerrar sesión</
        );
        assert.match(
          html,
          /app-header__logout-label/
        );
      }
    ),
    test(
      'no agrega el cierre de sesión al header cuando existe sidebar',
      () => {
        const html = renderHeader(false);

        assert.doesNotMatch(
          html,
          /app-header__logout-label/
        );
      }
    ),
  ]
);
