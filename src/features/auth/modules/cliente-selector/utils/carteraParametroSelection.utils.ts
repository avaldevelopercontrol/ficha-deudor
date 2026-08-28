import type { CarteraParametro } from '../../../types';

export const buildCarteraParametroSelectionKey = (
  cartera: Pick<CarteraParametro, 'campania' | 'anio' | 'numero'>
): string => `${cartera.campania}:${cartera.anio}:${cartera.numero}`;
