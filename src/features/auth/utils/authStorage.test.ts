import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { MemoryStorage } from '../../../test/doubles/MemoryStorage';
import {
  createAuthState,
  createCliente,
  createUsuario,
} from '../../../test/factories/auth.factory';
import {
  AUTH_LOGOUT_CUSTOM_EVENT,
  AUTH_STORAGE_KEYS,
  AUTH_STORAGE_VERSION,
} from '../constants/authStorage.constants';
import {
  clearStoredAuthState,
  hasStoredAuthState,
  initialAuthState,
  loadStoredAuthState,
  saveStoredAuthState,
} from './authStorage';

const withBrowserStorage = (
  run: (storage: MemoryStorage, dispatchedEvents: Event[]) => void
) => {
  const storage = new MemoryStorage();
  const dispatchedEvents: Event[] = [];
  const previousLocalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    'localStorage'
  );
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage,
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      dispatchEvent: (event: Event) => {
        dispatchedEvents.push(event);
        return true;
      },
    },
  });

  try {
    run(storage, dispatchedEvents);
  } finally {
    if (previousLocalStorage) {
      Object.defineProperty(globalThis, 'localStorage', previousLocalStorage);
    } else {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    }

    if (previousWindow) {
      Object.defineProperty(globalThis, 'window', previousWindow);
    } else {
      delete (globalThis as { window?: Window }).window;
    }
  }
};

export const suite = defineSuite('authStorage', [
  test('devuelve el estado inicial cuando no existe sesión guardada', () => {
    withBrowserStorage(() => {
      assert.deepEqual(loadStoredAuthState(), initialAuthState);
      assert.equal(hasStoredAuthState(), false);
    });
  }),
  test('guarda una sesión versionada sin estados transitorios', () => {
    withBrowserStorage((storage) => {
      saveStoredAuthState(
        createAuthState({ isLoading: true, error: 'Error temporal' })
      );

      const stored = JSON.parse(
        storage.getItem(AUTH_STORAGE_KEYS.STATE) ?? '{}'
      );
      const loaded = loadStoredAuthState();

      assert.equal(stored.version, AUTH_STORAGE_VERSION);
      assert.equal(typeof stored.savedAt, 'number');
      assert.equal('isAuthenticated' in stored, false);
      assert.equal('isLoading' in stored, false);
      assert.equal('error' in stored, false);
      assert.equal(loaded.isAuthenticated, true);
      assert.equal(loaded.usuario?.id_usuario, '16068');
      assert.equal(loaded.clienteSeleccionada?.id_cliente, '95');
    });
  }),
  test('migra una sesión anterior válida al formato versionado', () => {
    withBrowserStorage((storage) => {
      storage.setItem(
        AUTH_STORAGE_KEYS.STATE,
        JSON.stringify(createAuthState())
      );

      const loaded = loadStoredAuthState();
      const migrated = JSON.parse(
        storage.getItem(AUTH_STORAGE_KEYS.STATE) ?? '{}'
      );

      assert.equal(loaded.usuario?.id_usuario, '16068');
      assert.equal(migrated.version, AUTH_STORAGE_VERSION);
      assert.equal(migrated.usuario.id_usuario, '16068');
    });
  }),
  test('elimina el estado cuando no existe un usuario válido', () => {
    withBrowserStorage((storage) => {
      storage.setItem(AUTH_STORAGE_KEYS.STATE, 'contenido anterior');
      saveStoredAuthState(createAuthState({ usuario: null }));

      assert.equal(storage.getItem(AUTH_STORAGE_KEYS.STATE), null);

      saveStoredAuthState(
        createAuthState({
          usuario: createUsuario({ id_usuario: '0' }),
        })
      );

      assert.equal(storage.getItem(AUTH_STORAGE_KEYS.STATE), null);
    });
  }),
  test('descarta sesiones con usuario o cliente manipulados', () => {
    withBrowserStorage((storage) => {
      storage.setItem(AUTH_STORAGE_KEYS.STATE, '{invalid');
      assert.deepEqual(loadStoredAuthState(), initialAuthState);
      assert.equal(storage.getItem(AUTH_STORAGE_KEYS.STATE), null);

      storage.setItem(
        AUTH_STORAGE_KEYS.STATE,
        JSON.stringify(
          createAuthState({
            clienteSeleccionada: createCliente({ id_cliente: '-1' }),
          })
        )
      );
      assert.deepEqual(loadStoredAuthState(), initialAuthState);
      assert.equal(storage.getItem(AUTH_STORAGE_KEYS.STATE), null);
    });
  }),
  test('hasStoredAuthState valida el contenido antes de confirmar sesión', () => {
    withBrowserStorage((storage) => {
      storage.setItem(
        AUTH_STORAGE_KEYS.STATE,
        JSON.stringify({ usuario: { id_usuario: 'abc' } })
      );

      assert.equal(hasStoredAuthState(), false);
      assert.equal(storage.getItem(AUTH_STORAGE_KEYS.STATE), null);

      saveStoredAuthState(createAuthState({ clienteSeleccionada: null }));
      assert.equal(hasStoredAuthState(), true);
    });
  }),
  test('limpia token y sesión y publica el motivo del cierre', () => {
    withBrowserStorage((storage, events) => {
      storage.setItem(AUTH_STORAGE_KEYS.TOKEN, 'token');
      storage.setItem(AUTH_STORAGE_KEYS.STATE, '{}');

      clearStoredAuthState('last-main-window-closed');

      const logoutEvent = JSON.parse(
        storage.getItem(AUTH_STORAGE_KEYS.LOGOUT_EVENT) ?? '{}'
      );
      const customEvent = events[0] as CustomEvent;

      assert.equal(storage.getItem(AUTH_STORAGE_KEYS.TOKEN), null);
      assert.equal(storage.getItem(AUTH_STORAGE_KEYS.STATE), null);
      assert.equal(logoutEvent.reason, 'last-main-window-closed');
      assert.equal(typeof logoutEvent.at, 'number');
      assert.equal(customEvent.type, AUTH_LOGOUT_CUSTOM_EVENT);
      assert.deepEqual(customEvent.detail, logoutEvent);
    });
  }),
]);
