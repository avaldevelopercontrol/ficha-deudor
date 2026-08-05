export interface PagedCollectionOptions<TPage, TItem> {
  firstPageNumber: number;
  fetchPage: (pageNumber: number) => Promise<TPage>;
  getItems: (page: TPage) => TItem[];
  getTotalPages: (page: TPage) => number;
}

export const buildRemainingPageNumbers = (
  totalPages: number,
  firstPageNumber: number
): number[] => {
  if (totalPages <= firstPageNumber) {
    return [];
  }

  return Array.from(
    {
      length: totalPages - firstPageNumber,
    },
    (_, index) => firstPageNumber + index + 1
  );
};

/**
 * Obtiene la primera página y, cuando existen más,
 * solicita todas las restantes en paralelo.
 *
 * La función conserva el orden natural de páginas
 * porque Promise.all mantiene el orden del arreglo
 * de promesas recibido.
 */
export const fetchAllPagesInParallel = async <
  TPage,
  TItem,
>({
  firstPageNumber,
  fetchPage,
  getItems,
  getTotalPages,
}: PagedCollectionOptions<TPage, TItem>): Promise<TItem[]> => {
  const firstPage = await fetchPage(firstPageNumber);
  const remainingPageNumbers =
    buildRemainingPageNumbers(
      getTotalPages(firstPage),
      firstPageNumber
    );

  if (remainingPageNumbers.length === 0) {
    return getItems(firstPage);
  }

  const remainingPages = await Promise.all(
    remainingPageNumbers.map(fetchPage)
  );

  return [
    ...getItems(firstPage),
    ...remainingPages.flatMap(getItems),
  ];
};
