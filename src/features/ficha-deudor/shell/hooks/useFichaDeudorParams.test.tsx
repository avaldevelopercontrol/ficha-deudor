import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { AuthContextValue } from '@features/auth/types';
import { AuthContext } from '@features/auth/contexts/authContextValue';
import { defineSuite, test } from '../../../../test/testHarness';
import type { FichaDeudorParams } from '../../shared/types/fichaDeudor.types';
import { saveFichaDeudorSession } from '../../shared/utils/fichaDeudorSession.utils';
import { useFichaDeudorParams } from './useFichaDeudorParams';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(key: string) { return this.data.get(key) ?? null; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string) { this.data.delete(key); }
  setItem(key: string, value: string) { this.data.set(key, value); }
}

const params: FichaDeudorParams = {
  id_cliente: '1', id_cartera: '2', id_deudor: '3',
  id_contrato: '4', id_usuario: '5',
  fecha_inicio_gestion: '2026-08-04T09:00:00.000',
};

const createAuthValue = (idUsuario = '5', idCliente = '1'): AuthContextValue => ({
  isAuthenticated: true,
  usuario: {
    id_usuario: idUsuario, nombre: 'Usuario', apellido: 'Prueba',
    username: 'usuario', email: 'usuario@example.com', perfil: 'GESTOR', perfilId: 1,
  },
  clienteSeleccionada: { id_cliente: idCliente, nombre: 'Cliente', codigo: 'CLI', activa: true },
  isLoading: false, error: null,
  expiredPasswordChallenge: null,
  passwordExpiryWarning: null,
  login: async () => ({ success: true, code: '00', message: '', usuario: null }),
  logout: () => undefined,
  seleccionarCliente: () => undefined,
  clearError: () => undefined,
  clearExpiredPasswordChallenge: () => undefined,
  clearPasswordExpiryWarning: () => undefined,
});

const Probe = () => {
  const result = useFichaDeudorParams();
  return (
    <div
      data-valid={String(result.hasRequiredParams)}
      data-client={result.params.id_cliente}
      data-debtor={result.params.id_deudor}
      data-user={result.params.id_usuario}
    />
  );
};

const renderProbe = ({
  auth = createAuthValue(),
  state,
  search = '',
}: {
  auth?: AuthContextValue;
  state?: unknown;
  search?: string;
}) => {
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: new MemoryStorage(),
  });

  return renderToStaticMarkup(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[{ pathname: '/ficha-deudor', search, state }]}>
        <Probe />
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

export const suite = defineSuite('flujo de resolución de parámetros de ficha', [
  test('acepta parámetros válidos recibidos por navegación', () => {
    const html = renderProbe({ state: { fichaDeudorParams: params } });
    assert.match(html, /data-valid="true"/);
    assert.match(html, /data-client="1"/);
    assert.match(html, /data-debtor="3"/);
  }),
  test('rechaza parámetros de otro usuario autenticado', () => {
    const html = renderProbe({
      auth: createAuthValue('99', '1'),
      state: { fichaDeudorParams: params },
    });
    assert.match(html, /data-valid="false"/);
  }),
  test('recupera el contexto guardado cuando no existe state', () => {
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: new MemoryStorage(),
    });
    saveFichaDeudorSession(params);

    const html = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <MemoryRouter initialEntries={['/ficha-deudor']}>
          <Probe />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    assert.match(html, /data-valid="true"/);
    assert.match(html, /data-user="5"/);
  }),
  test('mantiene compatibilidad con parámetros de URL antiguos', () => {
    const search = '?id_cliente=1&id_cartera=2&id_deudor=3&id_contrato=4&id_usuario=5&fecha_inicio_gestion=2026-08-04T09%3A00%3A00.000';
    const html = renderProbe({ search });
    assert.match(html, /data-valid="true"/);
  }),
]);
