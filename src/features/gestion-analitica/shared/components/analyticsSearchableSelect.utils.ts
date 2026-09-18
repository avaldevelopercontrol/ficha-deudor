import type {
  AnalyticsSearchableSelectOption,
} from './analyticsSearchableSelect.types';

export const normalizeAnalyticsSearchText = (
  value: string
): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es-PE');

export const filterAnalyticsSearchableOptions = (
  options: readonly AnalyticsSearchableSelectOption[],
  search: string
): readonly AnalyticsSearchableSelectOption[] => {
  const normalizedSearch = normalizeAnalyticsSearchText(search);

  if (!normalizedSearch) {
    return options;
  }

  return options.filter((option) =>
    normalizeAnalyticsSearchText(option.label).includes(normalizedSearch)
  );
};
