import { fetchEvolucionComparativaCartera } from '../api/centroControlCarteraApi';
import type { EvolucionCarteraComparison } from '../domain/evolucionCartera.types';
import type { PortfolioOperationalContext } from '../domain/panoramaCartera.types';
import { mapEvolucionComparativaCarteraResponse } from '../mappers/evolucionCarteraComparativa.mapper';

export const loadEvolucionComparativaCartera = async (
  crmClientId: number,
  context: PortfolioOperationalContext,
  signal: AbortSignal
): Promise<EvolucionCarteraComparison> => {
  const response = await fetchEvolucionComparativaCartera(
    crmClientId,
    context,
    signal
  );

  return mapEvolucionComparativaCarteraResponse(response);
};
