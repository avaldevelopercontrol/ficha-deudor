import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { MemoryStorage } from '../../../test/doubles/MemoryStorage';
import {
  AUTH_LOGOUT_CUSTOM_EVENT,
  AUTH_STORAGE_KEYS,
} from '../constants/authStorage.constants';
import { isPublicAuthPath, logoutSession } from './logoutSession';

class CountingStorage extends MemoryStorage {
  readonly writes: string[] = [];

  override setItem(key: string, value: string): void {
    this.writes.push(key);
    super.setItem(key, value);
  }
}

const withLogoutBrowser = (
  run: (storage: CountingStorage, events: Event[]) => void
) => {
  const storage = new CountingStorage();
  const events: Event[] = [];
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
        events.push(event);
        return true;
      },
    },
  });

  try {
    run(storage, events);
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

export const suite = defineSuite('logoutSession', [
  test('reconoce únicamente las rutas públicas de autenticación', () => {
    assert.equal(isPublicAuthPath('/'), true);
    assert.equal(isPublicAuthPath('/login'), true);
    assert.equal(isPublicAuthPath('/menu-modulos'), false);
    assert.equal(isPublicAuthPath('/gestion-cobranzas/gestion-deudor'), false);
  }),
  test('limpia la sesión y publica una sola señal estructurada al cerrar la última ventana', () => {
    withLogoutBrowser((storage, events) => {
      storage.setItem(AUTH_STORAGE_KEYS.TOKEN, 'token');
      storage.setItem(AUTH_STORAGE_KEYS.STATE, '{}');
      storage.writes.length = 0;

      logoutSession();

      const logoutWrites = storage.writes.filter(
        (key) => key === AUTH_STORAGE_KEYS.LOGOUT_EVENT
      );
      const logoutEvent = JSON.parse(
        storage.getItem(AUTH_STORAGE_KEYS.LOGOUT_EVENT) ?? '{}'
      );
      const customEvent = events[0] as CustomEvent;

      assert.equal(storage.getItem(AUTH_STORAGE_KEYS.TOKEN), null);
      assert.equal(storage.getItem(AUTH_STORAGE_KEYS.STATE), null);
      assert.equal(logoutWrites.length, 1);
      assert.equal(logoutEvent.reason, 'last-main-window-closed');
      assert.equal(typeof logoutEvent.at, 'number');
      assert.equal(events.length, 1);
      assert.equal(customEvent.type, AUTH_LOGOUT_CUSTOM_EVENT);
      assert.deepEqual(customEvent.detail, logoutEvent);
    });
  }),
]);
