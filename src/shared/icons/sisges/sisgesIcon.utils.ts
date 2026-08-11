import {
  SISGES_ICON_BY_NAME,
  SISGES_ICON_CATALOG,
} from './sisgesIcon.catalog';
import type {
  SisgesIconDefinition,
  SisgesIconName,
} from './sisgesIcon.types';

export const DEFAULT_SISGES_ICON: SisgesIconName = 'module-default';

export const LEGACY_SISGES_ICON_ALIASES: Readonly<Record<string, SisgesIconName>> = {
  '/candado.ico': 'shield',
  'candado.ico': 'shield',
  '/datos.ico': 'database',
  'datos.ico': 'database',
  ICONO: 'module-default',
};

const normalizeSearchText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es-PE');

export const isSisgesIconName = (
  value: unknown
): value is SisgesIconName =>
  typeof value === 'string' &&
  SISGES_ICON_BY_NAME.has(value as SisgesIconName);

export const isSupportedSisgesIconValue = (
  value: string | null | undefined
): boolean => {
  const normalizedValue = value?.trim() ?? '';

  return (
    !normalizedValue ||
    isSisgesIconName(normalizedValue) ||
    Object.hasOwn(
      LEGACY_SISGES_ICON_ALIASES,
      normalizedValue
    )
  );
};

export const normalizeSisgesIconName = (
  value: string | null | undefined
): SisgesIconName => {
  const normalizedValue = value?.trim() ?? '';

  if (isSisgesIconName(normalizedValue)) {
    return normalizedValue;
  }

  return (
    LEGACY_SISGES_ICON_ALIASES[normalizedValue] ??
    DEFAULT_SISGES_ICON
  );
};

export const getSisgesIconDefinition = (
  value: string | null | undefined
): SisgesIconDefinition => {
  const name = normalizeSisgesIconName(value);
  const definition = SISGES_ICON_BY_NAME.get(name);

  if (!definition) {
    throw new Error(`No existe la definición del icono SISGES: ${name}`);
  }

  return definition;
};

export const searchSisgesIcons = (
  query: string
): readonly SisgesIconDefinition[] => {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return SISGES_ICON_CATALOG;
  }

  const searchTerms = normalizedQuery
    .split(/\s+/)
    .filter(Boolean);

  return SISGES_ICON_CATALOG.filter((icon) => {
    const searchableText = normalizeSearchText(
      [icon.name, icon.label, ...icon.keywords].join(' ')
    );

    return searchTerms.every((term) =>
      searchableText.includes(term)
    );
  });
};
