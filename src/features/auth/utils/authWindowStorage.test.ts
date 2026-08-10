import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { MemoryStorage } from '../../../test/doubles/MemoryStorage';
import {
  AUTH_STORAGE_KEYS,
} from '../constants/authStorage.constants';
import { AUTH_WINDOW_TIMING } from '../constants/authWindow.constants';
import {
  clearPendingLastMainLogout,
  getCleanActiveRegistry,
  getExistingWindowId,
  getWindowId,
  isPopupWindow,
  readMainWindowsRegistry,
  readPendingLastMainLogout,
  registerMainWindow,
  requestLastMainWindowLogout,
  unregisterMainWindow,
  writeMainWindowsRegistry,
} from './authWindowStorage';

interface FakeWindowOptions {
  pathname?: string;
  search?: string;
  opener?: object | null;
  uuid?: string;
}

const withBrowserWindow = (
  options: FakeWindowOptions,
  run: (local: MemoryStorage, session: MemoryStorage) => void
) => {
  const local = new MemoryStorage();
  const session = new MemoryStorage();
  const previousLocalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    'localStorage'
  );
  const previousSessionStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    'sessionStorage'
  );
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: local,
  });
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: session,
  });
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      opener: options.opener ?? null,
      location: {
        pathname: options.pathname ?? '/menu-modulos',
        search: options.search ?? '',
      },
      crypto: {
        randomUUID: () => options.uuid ?? 'window-uuid-1',
      },
    },
  });

  try {
    run(local, session);
  } finally {
    if (previousLocalStorage) {
      Object.defineProperty(globalThis, 'localStorage', previousLocalStorage);
    } else {
      delete (globalThis as { localStorage?: Storage }).localStorage;
    }

    if (previousSessionStorage) {
      Object.defineProperty(globalThis, 'sessionStorage', previousSessionStorage);
    } else {
      delete (globalThis as { sessionStorage?: Storage }).sessionStorage;
    }

    if (previousWindow) {
      Object.defineProperty(globalThis, 'window', previousWindow);
    } else {
      delete (globalThis as { window?: Window }).window;
    }
  }
};

export const suite = defineSuite('authWindowStorage', [
  test('reutiliza el identificador de ventana existente', () => {
    withBrowserWindow({}, (_local, session) => {
      session.setItem(AUTH_STORAGE_KEYS.WINDOW_ID, 'existing-window');

      assert.equal(getExistingWindowId(), 'existing-window');
      assert.equal(getWindowId(), 'existing-window');
    });
  }),
  test('genera y guarda un identificador cuando la ventana no tiene uno', () => {
    withBrowserWindow({ uuid: 'generated-window' }, (_local, session) => {
      assert.equal(getWindowId(), 'generated-window');
      assert.equal(
        session.getItem(AUTH_STORAGE_KEYS.WINDOW_ID),
        'generated-window'
      );
    });
  }),
  test('reconoce ventanas popup por opener, query o ruta', () => {
    withBrowserWindow({ opener: {} }, () => {
      assert.equal(isPopupWindow(), true);
    });
    withBrowserWindow({ search: '?popup=true' }, () => {
      assert.equal(isPopupWindow(), true);
    });
    withBrowserWindow({ pathname: '/email-deudor-popup' }, () => {
      assert.equal(isPopupWindow(), true);
    });
    withBrowserWindow({ pathname: '/menu-modulos' }, () => {
      assert.equal(isPopupWindow(), false);
    });
  }),
  test('guarda, recupera y elimina el registro de ventanas principales', () => {
    withBrowserWindow({}, (local) => {
      const registry = {
        one: { id: 'one', path: '/menu-modulos', lastSeen: 100 },
      };

      writeMainWindowsRegistry(registry);
      assert.deepEqual(readMainWindowsRegistry(), registry);

      writeMainWindowsRegistry({});
      assert.equal(local.getItem(AUTH_STORAGE_KEYS.MAIN_WINDOWS), null);
    });
  }),
  test('descarta registros corruptos y ventanas vencidas', () => {
    withBrowserWindow({}, (local) => {
      local.setItem(AUTH_STORAGE_KEYS.MAIN_WINDOWS, '{invalid');
      assert.deepEqual(readMainWindowsRegistry(), {});

      const now = 100_000;
      const clean = getCleanActiveRegistry(
        {
          active: {
            id: 'active',
            path: '/menu-modulos',
            lastSeen: now - 10,
          },
          stale: {
            id: 'stale',
            path: '/menu-modulos',
            lastSeen: now - AUTH_WINDOW_TIMING.ACTIVE_WINDOW_TTL_MS - 1,
          },
        },
        now
      );

      assert.deepEqual(Object.keys(clean), ['active']);
    });
  }),

  test('descarta entradas manipuladas y marcas de tiempo futuras del registro', () => {
    withBrowserWindow({}, (local) => {
      const now = Date.now();
      local.setItem(
        AUTH_STORAGE_KEYS.MAIN_WINDOWS,
        JSON.stringify({
          valid: {
            id: 'valid',
            path: '/menu-modulos',
            lastSeen: now,
          },
          mismatch: {
            id: 'different-id',
            path: '/menu-modulos',
            lastSeen: now,
          },
          invalidPath: {
            id: 'invalidPath',
            path: 'https://example.test',
            lastSeen: now,
          },
          invalidTimestamp: {
            id: 'invalidTimestamp',
            path: '/menu-modulos',
            lastSeen: 'ahora',
          },
        })
      );

      assert.deepEqual(Object.keys(readMainWindowsRegistry()), ['valid']);

      const clean = getCleanActiveRegistry(
        {
          valid: {
            id: 'valid',
            path: '/menu-modulos',
            lastSeen: now,
          },
          future: {
            id: 'future',
            path: '/menu-modulos',
            lastSeen: now + AUTH_WINDOW_TIMING.MAX_FUTURE_SKEW_MS + 1,
          },
        },
        now
      );

      assert.deepEqual(Object.keys(clean), ['valid']);
    });
  }),
  test('elimina solicitudes pendientes manipuladas o con fecha futura anómala', () => {
    withBrowserWindow({}, (local) => {
      local.setItem(
        AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT,
        JSON.stringify({ closedWindowId: '', requestedAt: Date.now() })
      );

      assert.equal(readPendingLastMainLogout(), null);
      assert.equal(
        local.getItem(AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT),
        null
      );

      local.setItem(
        AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT,
        JSON.stringify({
          closedWindowId: 'window-1',
          requestedAt:
            Date.now() + AUTH_WINDOW_TIMING.MAX_FUTURE_SKEW_MS + 10_000,
        })
      );

      assert.equal(readPendingLastMainLogout(), null);
    });
  }),
  test('limpia ventanas vencidas al registrar el heartbeat vigente', () => {
    withBrowserWindow({}, () => {
      const now = Date.now();
      writeMainWindowsRegistry({
        stale: {
          id: 'stale',
          path: '/anterior',
          lastSeen: now - AUTH_WINDOW_TIMING.ACTIVE_WINDOW_TTL_MS - 1,
        },
      });

      assert.equal(registerMainWindow('current'), true);
      assert.deepEqual(Object.keys(readMainWindowsRegistry()), ['current']);
    });
  }),
  test('gestiona la solicitud pendiente de cierre de la última ventana', () => {
    withBrowserWindow({}, (local) => {
      requestLastMainWindowLogout('window-1');

      const pending = readPendingLastMainLogout();
      assert.equal(pending?.closedWindowId, 'window-1');
      assert.equal(typeof pending?.requestedAt, 'number');

      clearPendingLastMainLogout();
      assert.equal(
        local.getItem(AUTH_STORAGE_KEYS.PENDING_LAST_MAIN_LOGOUT),
        null
      );
    });
  }),
  test('solicita logout únicamente cuando se elimina la última ventana', () => {
    withBrowserWindow({}, (local) => {
      const now = Date.now();
      writeMainWindowsRegistry({
        one: { id: 'one', path: '/uno', lastSeen: now },
        two: { id: 'two', path: '/dos', lastSeen: now },
      });

      unregisterMainWindow('one', true);
      assert.equal(readPendingLastMainLogout(), null);
      assert.deepEqual(Object.keys(readMainWindowsRegistry()), ['two']);

      unregisterMainWindow('two', true);
      assert.equal(readPendingLastMainLogout()?.closedWindowId, 'two');
      assert.equal(local.getItem(AUTH_STORAGE_KEYS.MAIN_WINDOWS), null);
    });
  }),
]);
