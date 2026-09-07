import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../test/testHarness';
import { AUTH_WINDOW_SYNC_CHANNEL } from '../constants/authWindow.constants';
import { createAuthWindowSyncChannel } from './authWindowSyncChannel';

class FakeBroadcastChannel {
  static current: FakeBroadcastChannel | null = null;

  readonly name: string;
  readonly posted: unknown[] = [];
  closed = false;
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;

  constructor(name: string) {
    this.name = name;
    FakeBroadcastChannel.current = this;
  }

  postMessage(value: unknown) {
    this.posted.push(value);
  }

  close() {
    this.closed = true;
  }

  emit(value: unknown) {
    this.onmessage?.({ data: value } as MessageEvent<unknown>);
  }
}

const withBroadcastChannel = (
  constructorValue: unknown,
  run: () => void
) => {
  const previousDescriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    'BroadcastChannel'
  );

  Object.defineProperty(globalThis, 'BroadcastChannel', {
    configurable: true,
    value: constructorValue,
  });

  try {
    run();
  } finally {
    FakeBroadcastChannel.current = null;

    if (previousDescriptor) {
      Object.defineProperty(
        globalThis,
        'BroadcastChannel',
        previousDescriptor
      );
    } else {
      delete (globalThis as { BroadcastChannel?: unknown }).BroadcastChannel;
    }
  }
};

class ThrowingBroadcastChannel {
  constructor(name: string) {
    void name;
    throw new Error('BroadcastChannel unavailable');
  }
}

class FragileBroadcastChannel extends FakeBroadcastChannel {
  override postMessage(value: unknown) {
    void value;
    throw new Error('postMessage failed');
  }

  override close() {
    throw new Error('close failed');
  }
}

export const suite = defineSuite('authWindowSyncChannel', [
  test('usa BroadcastChannel como señal complementaria cuando está disponible', () => {
    withBroadcastChannel(FakeBroadcastChannel, () => {
      const received: string[] = [];
      const syncChannel = createAuthWindowSyncChannel((signal) => {
        received.push(signal);
      });
      const channel = FakeBroadcastChannel.current;

      assert.ok(syncChannel);
      assert.ok(channel);
      assert.equal(channel.name, AUTH_WINDOW_SYNC_CHANNEL);

      syncChannel.publish('presence-changed');
      assert.deepEqual(channel.posted, ['presence-changed']);

      channel.emit('pending-logout');
      channel.emit('mensaje-manipulado');
      assert.deepEqual(received, ['pending-logout']);

      syncChannel.close();
      assert.equal(channel.closed, true);
    });
  }),
  test('mantiene el fallback de storage cuando BroadcastChannel no está disponible', () => {
    withBroadcastChannel(undefined, () => {
      assert.equal(createAuthWindowSyncChannel(() => undefined), null);
    });
  }),
  test('usa el fallback cuando el constructor de BroadcastChannel falla', () => {
    withBroadcastChannel(ThrowingBroadcastChannel, () => {
      assert.equal(createAuthWindowSyncChannel(() => undefined), null);
    });
  }),
  test('no propaga fallos al publicar o cerrar el canal complementario', () => {
    withBroadcastChannel(FragileBroadcastChannel, () => {
      const syncChannel = createAuthWindowSyncChannel(() => undefined);

      assert.ok(syncChannel);
      assert.doesNotThrow(() => syncChannel.publish('presence-changed'));
      assert.doesNotThrow(() => syncChannel.close());
    });
  }),
]);
