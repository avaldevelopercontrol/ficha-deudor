import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { AUTH_WINDOW_TIMING } from '../constants/authWindow.constants';
import {
  resolvePendingLastMainLogout,
  shouldUnregisterMainWindowOnPageHide,
} from './lastMainWindowLogout.utils';

const NOW = 1_000_000;

export const suite = defineSuite('lastMainWindowLogout.utils', [
  test('limpia ventanas vencidas aunque no exista un cierre pendiente', () => {
    const resolution = resolvePendingLastMainLogout({
      pendingLogout: null,
      registry: {
        active: {
          id: 'active',
          path: '/menu-modulos',
          lastSeen: NOW - 100,
        },
        stale: {
          id: 'stale',
          path: '/menu-modulos',
          lastSeen: NOW - AUTH_WINDOW_TIMING.ACTIVE_WINDOW_TTL_MS - 1,
        },
      },
      now: NOW,
      currentWindowId: null,
      allowSameWindowResume: true,
      waitGraceBeforeLogout: false,
    });

    assert.equal(resolution.action, 'none');
    assert.deepEqual(Object.keys(resolution.cleanRegistry), ['active']);
  }),
  test('cancela el cierre cuando todavía existe otra ventana principal', () => {
    const resolution = resolvePendingLastMainLogout({
      pendingLogout: {
        closedWindowId: 'closed',
        requestedAt: NOW - 100,
      },
      registry: {
        active: {
          id: 'active',
          path: '/gestion-cobranzas',
          lastSeen: NOW,
        },
      },
      now: NOW,
      currentWindowId: null,
      allowSameWindowResume: false,
      waitGraceBeforeLogout: true,
    });

    assert.equal(resolution.action, 'cancel');
  }),
  test('cancela el cierre cuando la misma pestaña reaparece dentro de la gracia', () => {
    const resolution = resolvePendingLastMainLogout({
      pendingLogout: {
        closedWindowId: 'same-window',
        requestedAt: NOW - AUTH_WINDOW_TIMING.RELOAD_GRACE_MS,
      },
      registry: {},
      now: NOW,
      currentWindowId: 'same-window',
      allowSameWindowResume: true,
      waitGraceBeforeLogout: false,
    });

    assert.equal(resolution.action, 'cancel');
  }),
  test('espera la gracia en popups y luego autoriza el cierre de sesión', () => {
    const pendingLogout = {
      closedWindowId: 'closed-window',
      requestedAt: NOW,
    };

    const waiting = resolvePendingLastMainLogout({
      pendingLogout,
      registry: {},
      now: NOW + AUTH_WINDOW_TIMING.RELOAD_GRACE_MS,
      currentWindowId: null,
      allowSameWindowResume: false,
      waitGraceBeforeLogout: true,
    });
    const expired = resolvePendingLastMainLogout({
      pendingLogout,
      registry: {},
      now: NOW + AUTH_WINDOW_TIMING.RELOAD_GRACE_MS + 1,
      currentWindowId: null,
      allowSameWindowResume: false,
      waitGraceBeforeLogout: true,
    });

    assert.equal(waiting.action, 'wait');
    assert.equal(expired.action, 'logout');
  }),
  test('no libera una ventana enviada al back-forward cache', () => {
    assert.equal(shouldUnregisterMainWindowOnPageHide(true), false);
    assert.equal(shouldUnregisterMainWindowOnPageHide(false), true);
  }),
]);
