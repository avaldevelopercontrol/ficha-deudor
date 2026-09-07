import assert from 'node:assert/strict';
import type { NavigateFunction } from 'react-router-dom';

import { GESTION_COBRANZAS_ROUTES } from '@features/gestion-cobranzas/constants/gestionCobranzasRoutes.constants';
import { defineSuite, test } from '../../../../test/testHarness';
import type { FichaDeudorParams } from '../../shared/types/fichaDeudor.types';
import {
  loadFichaDeudorSession,
  saveFichaDeudorSession,
} from '../../shared/utils/fichaDeudorSession.utils';
import {
  exitFichaDeudor,
  getFichaDeudorReturnPath,
} from './useFichaDeudorNavigation';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}

const params: FichaDeudorParams = {
  id_cliente: '1',
  id_cartera: '2',
  id_deudor: '3',
  id_contrato: '4',
  id_usuario: '5',
  fecha_inicio_gestion: '2026-08-28T15:00:00.000',
};

const installSessionStorage = () => {
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: new MemoryStorage(),
  });
};

export const suite = defineSuite('navegación de salida de Ficha Deudor', [
  test('obtiene el origen solo cuando state.from es string', () => {
    assert.equal(
      getFichaDeudorReturnPath({ from: GESTION_COBRANZAS_ROUTES.GESTION_DEUDOR }),
      GESTION_COBRANZAS_ROUTES.GESTION_DEUDOR
    );
    assert.equal(getFichaDeudorReturnPath({ from: 123 }), null);
    assert.equal(getFichaDeudorReturnPath(null), null);
  }),
  test('vuelve atrás cuando la ficha provino de Gestión Deudor y limpia la sesión', () => {
    installSessionStorage();
    saveFichaDeudorSession(params);

    const calls: unknown[][] = [];
    const navigate = ((...args: unknown[]) => {
      calls.push(args);
    }) as NavigateFunction;

    exitFichaDeudor(navigate, GESTION_COBRANZAS_ROUTES.GESTION_DEUDOR);

    assert.equal(loadFichaDeudorSession(), null);
    assert.deepEqual(calls, [[-1]]);
  }),
  test('redirige reemplazando historial cuando no existe origen compatible', () => {
    installSessionStorage();
    saveFichaDeudorSession(params);

    const calls: unknown[][] = [];
    const navigate = ((...args: unknown[]) => {
      calls.push(args);
    }) as NavigateFunction;

    exitFichaDeudor(navigate, null);

    assert.equal(loadFichaDeudorSession(), null);
    assert.deepEqual(calls, [
      [GESTION_COBRANZAS_ROUTES.GESTION_DEUDOR, { replace: true }],
    ]);
  }),
]);
