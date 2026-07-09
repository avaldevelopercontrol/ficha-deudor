interface GetPopupPaginationRangeParams {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
}

interface PopupPaginationRange {
  indiceInicio: number;
  indiceFin: number;
}

export const getPopupPaginationRange = ({
  pageNumber,
  pageSize,
  totalRecords,
}: GetPopupPaginationRangeParams): PopupPaginationRange => ({
  indiceInicio: (pageNumber - 1) * pageSize,
  indiceFin: Math.min(pageNumber * pageSize, totalRecords),
});