import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../test/testHarness';
import { AUTH_WINDOW_TIMING } from './authWindow.constants';

export const suite = defineSuite('authWindow.constants', [
  test('mantiene un lease ampliamente mayor que el heartbeat', () => {
    assert.ok(AUTH_WINDOW_TIMING.HEARTBEAT_MS > 0);
    assert.ok(
      AUTH_WINDOW_TIMING.ACTIVE_WINDOW_TTL_MS >=
        AUTH_WINDOW_TIMING.HEARTBEAT_MS * 3
    );
  }),
  test('mantiene la gracia de reload por debajo del lease de presencia', () => {
    assert.ok(AUTH_WINDOW_TIMING.RELOAD_GRACE_MS > 0);
    assert.ok(
      AUTH_WINDOW_TIMING.RELOAD_GRACE_MS <
        AUTH_WINDOW_TIMING.ACTIVE_WINDOW_TTL_MS
    );
  }),
  test('mantiene el fallback de popup más lento que la gracia event-driven', () => {
    assert.ok(
      AUTH_WINDOW_TIMING.POPUP_FALLBACK_CHECK_MS >
        AUTH_WINDOW_TIMING.RELOAD_GRACE_MS
    );
  }),
]);
