import type { SelectOption } from '../../types';

export const normalizeSearchableSelectText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es-PE');

export const filterSearchableSelectOptions = <
  T extends string | number | boolean,
>(
  options: readonly SelectOption<T>[],
  search: string
): readonly SelectOption<T>[] => {
  const normalizedSearch = normalizeSearchableSelectText(search);

  if (!normalizedSearch) {
    return options;
  }

  return options.filter((option) =>
    normalizeSearchableSelectText(option.label).includes(normalizedSearch)
  );
};
