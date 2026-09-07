import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../test/testHarness';
import { FICHA_DEUDOR_PANEL } from '../constants/fichaDeudorPanels.constants';
import {
  toggleFichaDeudorPanel,
  type FichaDeudorPanelsState,
} from './useFichaDeudorPanels';

const initialState = (): FichaDeudorPanelsState => ({
  panelActivo: null,
  panelesInicializados: new Set(),
});

export const suite = defineSuite('estado de paneles de Ficha Deudor', [
  test('activa e inicializa un panel en la primera apertura', () => {
    const next = toggleFichaDeudorPanel(
      initialState(),
      FICHA_DEUDOR_PANEL.DATOS_ADICIONALES
    );

    assert.equal(
      next.panelActivo,
      FICHA_DEUDOR_PANEL.DATOS_ADICIONALES
    );
    assert.equal(
      next.panelesInicializados.has(
        FICHA_DEUDOR_PANEL.DATOS_ADICIONALES
      ),
      true
    );
  }),
  test('cierra el panel activo sin perder su estado de inicializado', () => {
    const opened = toggleFichaDeudorPanel(
      initialState(),
      FICHA_DEUDOR_PANEL.DATOS_ADICIONALES
    );
    const closed = toggleFichaDeudorPanel(
      opened,
      FICHA_DEUDOR_PANEL.DATOS_ADICIONALES
    );

    assert.equal(closed.panelActivo, null);
    assert.equal(
      closed.panelesInicializados.has(
        FICHA_DEUDOR_PANEL.DATOS_ADICIONALES
      ),
      true
    );
  }),
  test('conserva los paneles ya inicializados al cambiar de panel', () => {
    const first = toggleFichaDeudorPanel(
      initialState(),
      FICHA_DEUDOR_PANEL.DATOS_ADICIONALES
    );
    const second = toggleFichaDeudorPanel(
      first,
      FICHA_DEUDOR_PANEL.GESTION_REALIZADA
    );

    assert.equal(
      second.panelActivo,
      FICHA_DEUDOR_PANEL.GESTION_REALIZADA
    );
    assert.equal(second.panelesInicializados.size, 2);
    assert.equal(
      second.panelesInicializados.has(
        FICHA_DEUDOR_PANEL.DATOS_ADICIONALES
      ),
      true
    );
    assert.equal(
      second.panelesInicializados.has(
        FICHA_DEUDOR_PANEL.GESTION_REALIZADA
      ),
      true
    );
  }),
]);
