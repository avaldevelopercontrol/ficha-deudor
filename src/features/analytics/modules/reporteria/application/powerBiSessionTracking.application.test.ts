import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  accumulateVisibleTime,
  finishPowerBiSession,
  reportPowerBiSessionActivity,
  startPowerBiSession,
  toVisibleSeconds,
} from './powerBiSessionTracking.application';

export const suite = defineSuite(
  'power bi session tracking application',
  [

    test(
      'coordina apertura actividad y cierre sin alterar los payloads de telemetría',
      async () => {
        const calls: unknown[] = [];
        const dependencies = {
          open: async (input: unknown) => {
            calls.push(['open', input]);
            return {
              sessionId: 'session-1',
              startedAtUtc: '2026-09-14T21:00:00Z',
            };
          },
          updateActivity: async (sessionId: string, input: unknown) => {
            calls.push(['activity', sessionId, input]);
          },
          close: async (sessionId: string, input: unknown, keepalive?: boolean) => {
            calls.push(['close', sessionId, input, keepalive]);
          },
        };

        const opened = await startPowerBiSession(
          {
            optionId: 47,
            client: { clientId: 95, name: 'CLARO' },
          },
          undefined,
          dependencies
        );

        await reportPowerBiSessionActivity(
          opened.sessionId,
          { visibleSeconds: 60, visible: true },
          dependencies
        );

        await finishPowerBiSession(
          opened.sessionId,
          { visibleSeconds: 75, reason: 'NAVEGACION' },
          true,
          dependencies
        );

        assert.deepEqual(calls, [
          [
            'open',
            {
              optionId: 47,
              client: { clientId: 95, name: 'CLARO' },
            },
          ],
          [
            'activity',
            'session-1',
            { visibleSeconds: 60, visible: true },
          ],
          [
            'close',
            'session-1',
            { visibleSeconds: 75, reason: 'NAVEGACION' },
            true,
          ],
        ]);
      }
    ),
    test(
      'calcula segundos visibles sumando el segmento activo al acumulado',
      () => {
        assert.equal(
          toVisibleSeconds(45_000, 100_000, 115_900),
          60
        );
      }
    ),
    test(
      'una pestaña pausada conserva el tiempo acumulado sin agregar tiempo oculto',
      () => {
        assert.equal(
          toVisibleSeconds(92_400, null, 500_000),
          92
        );
      }
    ),
    test(
      'acumula el segmento visible al cambiar la pestaña a hidden',
      () => {
        assert.equal(
          accumulateVisibleTime(
            30_000,
            200_000,
            212_500
          ),
          42_500
        );
      }
    ),
  ]
);
