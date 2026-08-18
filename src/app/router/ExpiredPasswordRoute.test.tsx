import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';

import { AuthContext } from '../../features/auth/contexts/authContextValue';
import {
  createAuthContextValue,
} from '../../test/factories/auth.factory';
import { defineSuite, test } from '../../test/testHarness';
import { ExpiredPasswordRoute } from './ExpiredPasswordRoute';

const renderExpiredPasswordRoute = (
  hasChallenge: boolean
) => renderToStaticMarkup(
  <MemoryRouter initialEntries={['/cambiar-clave-expirada']}>
    <AuthContext.Provider
      value={createAuthContextValue({
        isAuthenticated: false,
        usuario: null,
        clienteSeleccionada: null,
        expiredPasswordChallenge: hasChallenge
          ? {
              userId: '16149',
              message: 'Su clave ha expirado.',
            }
          : null,
      })}
    >
      <Routes>
        <Route element={<ExpiredPasswordRoute />}>
          <Route
            path="/cambiar-clave-expirada"
            element={<div>Cambio obligatorio</div>}
          />
        </Route>
        <Route path="/login" element={<div>Página de login</div>} />
      </Routes>
    </AuthContext.Provider>
  </MemoryRouter>
);

export const suite = defineSuite('ExpiredPasswordRoute', [
  test('permite la pantalla únicamente cuando existe un reto de clave expirada', () => {
    const html = renderExpiredPasswordRoute(true);

    assert.match(html, /Cambio obligatorio/);
  }),
  test('bloquea el acceso directo cuando no existe un reto vigente', () => {
    const html = renderExpiredPasswordRoute(false);

    assert.doesNotMatch(html, /Cambio obligatorio/);
    assert.equal(html, '');
  }),
]);
