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
  createCliente,
  createUsuario,
} from '../../test/factories/auth.factory';
import { defineSuite, test } from '../../test/testHarness';
import { PublicRoute } from './PublicRoute';

const renderPublicRoute = (
  authOverrides: Parameters<typeof createAuthContextValue>[0]
) => renderToStaticMarkup(
  <MemoryRouter initialEntries={['/login']}>
    <AuthContext.Provider value={createAuthContextValue(authOverrides)}>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<div>Página pública</div>} />
        </Route>
        <Route path="/menu-modulos" element={<div>Menú privado</div>} />
      </Routes>
    </AuthContext.Provider>
  </MemoryRouter>
);

export const suite = defineSuite('PublicRoute', [
  test('mantiene el login disponible para anónimos y selección pendiente', () => {
    const anonymous = renderPublicRoute({
      isAuthenticated: false,
      usuario: null,
      clienteSeleccionada: null,
    });
    const pendingClient = renderPublicRoute({
      isAuthenticated: true,
      usuario: createUsuario(),
      clienteSeleccionada: null,
    });

    assert.match(anonymous, /Página pública/);
    assert.match(pendingClient, /Página pública/);
  }),
  test('redirige cuando usuario y cliente permiten acceso privado', () => {
    const html = renderPublicRoute({
      isAuthenticated: false,
      usuario: createUsuario(),
      clienteSeleccionada: createCliente(),
    });

    assert.doesNotMatch(html, /Página pública/);
    assert.doesNotMatch(html, /Menú privado/);
    assert.equal(html, '');
  }),
]);
