import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';
import { defineSuite, test } from '../../test/testHarness';
import {
  createAuthContextValue,
  createCliente,
  createUsuario,
} from '../../test/factories/auth.factory';
import { AuthContext } from '../../features/auth/contexts/authContextValue';
import { ProtectedRoute } from './ProtectedRoute';

const renderProtectedRoute = (
  authOverrides: Parameters<typeof createAuthContextValue>[0]
) => renderToStaticMarkup(
  <MemoryRouter initialEntries={['/private']}>
    <AuthContext.Provider value={createAuthContextValue(authOverrides)}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/private" element={<div>Contenido privado</div>} />
        </Route>
        <Route path="/login" element={<div>Página de login</div>} />
      </Routes>
    </AuthContext.Provider>
  </MemoryRouter>
);

export const suite = defineSuite('ProtectedRoute', [
  test('permite acceso cuando existen usuario y cliente', () => {
    const html = renderProtectedRoute({
      usuario: createUsuario(),
      clienteSeleccionada: createCliente(),
    });

    assert.match(html, /Contenido privado/);
    assert.doesNotMatch(html, /Página de login/);
  }),
  test('bloquea el contenido privado cuando falta usuario o cliente', () => {
    const withoutUser = renderProtectedRoute({
      usuario: null,
      clienteSeleccionada: createCliente(),
    });
    const withoutClient = renderProtectedRoute({
      usuario: createUsuario(),
      clienteSeleccionada: null,
    });

    assert.doesNotMatch(withoutUser, /Contenido privado/);
    assert.doesNotMatch(withoutClient, /Contenido privado/);
    assert.equal(withoutUser, '');
    assert.equal(withoutClient, '');
  }),
]);
