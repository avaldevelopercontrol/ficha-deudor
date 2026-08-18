import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import { AuthContext } from '@features/auth/contexts/authContextValue';
import {
  createAuthContextValue,
  createCliente,
  createUsuario,
} from '../../../test/factories/auth.factory';
import { defineSuite, test } from '../../../test/testHarness';
import { useAccessControl } from '../hooks/useAccessControl';
import { AccessControlProvider } from './AccessControlProvider';

const AccessControlStatusProbe = () => {
  const { status } = useAccessControl();

  return <span>{status}</span>;
};

const renderProvider = ({
  usuario = createUsuario(),
  clienteSeleccionada = null as ReturnType<typeof createCliente> | null,
}) => renderToStaticMarkup(
  <AuthContext.Provider
    value={createAuthContextValue({
      usuario,
      clienteSeleccionada,
      isAuthenticated: true,
    })}
  >
    <AccessControlProvider>
      <AccessControlStatusProbe />
    </AccessControlProvider>
  </AuthContext.Provider>
);

export const suite = defineSuite('AccessControlProvider', [
  test('mantiene access-control inactivo mientras el usuario todavía debe seleccionar cliente', () => {
    const html = renderProvider({
      usuario: createUsuario(),
      clienteSeleccionada: null,
    });

    assert.match(html, />idle</);
  }),
  test('inicializa la sesión de permisos cuando usuario y cliente ya están disponibles', () => {
    const html = renderProvider({
      usuario: createUsuario(),
      clienteSeleccionada: createCliente(),
    });

    assert.match(html, />loading</);
  }),
]);
