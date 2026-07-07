type CatalogOptionSource = {
  id: string | number;
  nombre: string;
};

export const mapCatalogToSelectOptions = <T extends CatalogOptionSource>(
  items?: T[] | null
) => items?.map(({ id, nombre }) => ({ id, label: nombre })) ?? [];

export const getLoadingSelectPlaceholder = (
  isLoading: boolean,
  loadingText: string,
  defaultText: string
): string => (isLoading ? loadingText : defaultText);