import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../test/testHarness';
import {
  getPopupContextStorageKey,
  loadPopupContextFromStorage,
  POPUP_CONTEXT_MAX_AGE_MS,
  POPUP_CONTEXT_STORAGE_VERSION,
  savePopupContextToStorage,
} from './popupContextStorage.utils';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(key: string) { return this.data.get(key) ?? null; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string) { this.data.delete(key); }
  setItem(key: string, value: string) { this.data.set(key, value); }
}

const popupType = 'lista-gestores' as const;
const popupId = 'popup-123';
const context = {
  idCliente: '1',
};
const now = Date.UTC(2026, 7, 4, 15, 0, 0);

const storageKey = getPopupContextStorageKey(
  popupType,
  popupId
);

export const suite = defineSuite(
  'popupContextStorage.utils',
  [
    test(
      'guarda y recupera un contexto versionado vigente',
      () => {
        const storage = new MemoryStorage();

        savePopupContextToStorage(
          storage,
          popupType,
          popupId,
          context,
          now
        );

        assert.deepEqual(
          loadPopupContextFromStorage(
            storage,
            popupType,
            popupId,
            now
          ),
          context
        );
      }
    ),
    test(
      'descarta y elimina contextos vencidos',
      () => {
        const storage = new MemoryStorage();

        savePopupContextToStorage(
          storage,
          popupType,
          popupId,
          context,
          now
        );

        assert.equal(
          loadPopupContextFromStorage(
            storage,
            popupType,
            popupId,
            now + POPUP_CONTEXT_MAX_AGE_MS + 1
          ),
          null
        );
        assert.equal(storage.length, 0);
      }
    ),
    test(
      'elimina contenido corrupto y formatos anteriores sin versión',
      () => {
        const storage = new MemoryStorage();

        storage.setItem(storageKey, '{invalid');
        assert.equal(
          loadPopupContextFromStorage(
            storage,
            popupType,
            popupId,
            now
          ),
          null
        );

        storage.setItem(
          storageKey,
          JSON.stringify(context)
        );
        assert.equal(
          loadPopupContextFromStorage(
            storage,
            popupType,
            popupId,
            now
          ),
          null
        );
        assert.equal(storage.length, 0);
      }
    ),
    test(
      'rechaza versiones tipos o identificadores que no corresponden',
      () => {
        const invalidEnvelopes = [
          {
            version: POPUP_CONTEXT_STORAGE_VERSION + 1,
            savedAt: now,
            popupType,
            popupId,
            context,
          },
          {
            version: POPUP_CONTEXT_STORAGE_VERSION,
            savedAt: now,
            popupType: 'produccion-gestor-hoy',
            popupId,
            context: {
              idCliente: '1',
              idUsuario: '2',
            },
          },
          {
            version: POPUP_CONTEXT_STORAGE_VERSION,
            savedAt: now,
            popupType,
            popupId: 'otro-popup',
            context,
          },
        ];

        for (const envelope of invalidEnvelopes) {
          const storage = new MemoryStorage();
          storage.setItem(
            storageKey,
            JSON.stringify(envelope)
          );

          assert.equal(
            loadPopupContextFromStorage(
              storage,
              popupType,
              popupId,
              now
            ),
            null
          );
          assert.equal(storage.length, 0);
        }
      }
    ),
    test(
      'rechaza contextos almacenados con una fecha futura anómala',
      () => {
        const storage = new MemoryStorage();

        savePopupContextToStorage(
          storage,
          popupType,
          popupId,
          context,
          now + 10 * 60 * 1_000
        );

        assert.equal(
          loadPopupContextFromStorage(
            storage,
            popupType,
            popupId,
            now
          ),
          null
        );
        assert.equal(storage.length, 0);
      }
    ),
  ]
);
