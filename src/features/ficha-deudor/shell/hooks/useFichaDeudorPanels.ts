import { useCallback, useState } from 'react';

import type { FichaDeudorPanel } from '../constants/fichaDeudorPanels.constants';

export interface FichaDeudorPanelsState {
  panelActivo: FichaDeudorPanel | null;
  panelesInicializados: ReadonlySet<FichaDeudorPanel>;
}

const createInitialPanelsState = (): FichaDeudorPanelsState => ({
  panelActivo: null,
  panelesInicializados: new Set<FichaDeudorPanel>(),
});

export const toggleFichaDeudorPanel = (
  state: FichaDeudorPanelsState,
  panel: FichaDeudorPanel
): FichaDeudorPanelsState => {
  const panelesInicializados = state.panelesInicializados.has(panel)
    ? state.panelesInicializados
    : new Set([...state.panelesInicializados, panel]);

  return {
    panelActivo: state.panelActivo === panel ? null : panel,
    panelesInicializados,
  };
};

export const useFichaDeudorPanels = () => {
  const [state, setState] = useState<FichaDeudorPanelsState>(
    createInitialPanelsState
  );

  const togglePanel = useCallback((panel: FichaDeudorPanel) => {
    setState((current) => toggleFichaDeudorPanel(current, panel));
  }, []);

  return {
    panelActivo: state.panelActivo,
    panelesInicializados: state.panelesInicializados,
    togglePanel,
  };
};
