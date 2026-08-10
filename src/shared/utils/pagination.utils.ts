export interface ClientPaginationState {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

const toPositiveInteger = (
  value: number,
  fallback: number
): number => {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  const normalizedValue = Math.trunc(value);

  return normalizedValue > 0
    ? normalizedValue
    : fallback;
};

export const clampPageNumber = (
  pageNumber: number,
  totalPages: number
): number => {
  const safeTotalPages = toPositiveInteger(
    totalPages,
    1
  );

  if (!Number.isFinite(pageNumber)) {
    return 1;
  }

  const normalizedPageNumber = Math.trunc(
    pageNumber
  );

  return Math.min(
    safeTotalPages,
    Math.max(1, normalizedPageNumber)
  );
};

export const resolveClientPagination = (
  totalRecords: number,
  pageSize: number,
  pageNumber: number
): ClientPaginationState => {
  const safeTotalRecords = Math.max(
    0,
    Math.trunc(
      Number.isFinite(totalRecords)
        ? totalRecords
        : 0
    )
  );
  const safePageSize = toPositiveInteger(
    pageSize,
    1
  );
  const totalPages = Math.max(
    1,
    Math.ceil(
      safeTotalRecords / safePageSize
    )
  );
  const safePageNumber = clampPageNumber(
    pageNumber,
    totalPages
  );
  const startIndex =
    (safePageNumber - 1) * safePageSize;
  const endIndex = Math.min(
    startIndex + safePageSize,
    safeTotalRecords
  );

  return {
    pageNumber: safePageNumber,
    pageSize: safePageSize,
    totalPages,
    startIndex,
    endIndex,
  };
};
