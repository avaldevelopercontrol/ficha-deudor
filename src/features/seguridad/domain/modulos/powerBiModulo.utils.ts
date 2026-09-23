import {
  APPLICATION_OPTION_IDS,
} from '@features/access-control/registry/applicationOptionIds';

import {
  normalizePowerBiPublishToWebUrl,
  normalizePowerBiServiceUrl,
} from '@shared/utils/powerBiUrl.utils';

import type {
  Modulo,
} from '../../types/opcion.types';

export const POWER_BI_PARENT_OPTION_ID =
  APPLICATION_OPTION_IDS.REPORTERIA;

export const POWER_BI_DEFAULT_ICON =
  'analytics';

/**
 * En el catálogo SISGES, las opciones administrables como BI se encuentran
 * en el nivel 4 de la jerarquía. Mantener esta regla en dominio evita que la
 * pantalla dependa de nombres, rutas o padres que pueden cambiar.
 */
export const POWER_BI_CATALOG_LEVEL = 4;

export const isPowerBiCatalogModulo = (
  modulo: Pick<Modulo, 'tipo'>
): boolean =>
  modulo.tipo === POWER_BI_CATALOG_LEVEL;

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
): boolean =>
  normalizePowerBiServiceUrl(value) !== null;

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

export const isValidPowerBiPublishToWebUrl = (
  value: string
): boolean =>
  normalizePowerBiPublishToWebUrl(value) !== null;
