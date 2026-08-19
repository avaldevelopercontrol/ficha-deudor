import {
  APPLICATION_OPTION_IDS,
} from '@features/access-control/registry/applicationOptionIds';

import type {
  Modulo,
} from '../../../types/opcion.types';

export const POWER_BI_PARENT_OPTION_ID =
  APPLICATION_OPTION_IDS.REPORTERIA;

export const POWER_BI_DEFAULT_ICON =
  'analytics';

export const hasModuloChildren = (
  moduloId: number,
  modulos: readonly Modulo[]
): boolean =>
  modulos.some(
    (modulo) =>
      modulo.idPadre === moduloId
  );

export const isValidPowerBiUrl = (
  value: string
): boolean => {
  const normalized = value.trim();

  if (!normalized) {
    return false;
  }

  try {
    const url = new URL(normalized);

    return (
      url.protocol === 'https:' ||
      url.protocol === 'http:'
    );
  } catch {
    return false;
  }
};

export const isValidOptionImageSource = (
  value: string
): boolean => {
  const normalized = value.trim();

  if (!normalized) {
    return true;
  }

  if (normalized.startsWith('/')) {
    return !normalized.startsWith('//');
  }

  try {
    const url = new URL(normalized);

    return (
      url.protocol === 'https:' ||
      url.protocol === 'http:'
    );
  } catch {
    return false;
  }
};
