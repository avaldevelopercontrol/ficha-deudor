interface PopupDeudorSearchParams {
  nombre: string;
  documento: string;
}

const getDecodedSearchParam = (
  searchParams: URLSearchParams,
  key: string
): string => decodeURIComponent(searchParams.get(key) || '');

export const getPopupDeudorSearchParams = (
  searchParams: URLSearchParams
): PopupDeudorSearchParams => ({
  nombre: getDecodedSearchParam(searchParams, 'nombre'),
  documento: getDecodedSearchParam(searchParams, 'documento'),
});