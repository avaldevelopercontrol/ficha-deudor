interface OpenPopupWindowParams {
  path: string;
  name: string;
  features: string;
  origin?: string;
}

export const buildPopupUrl = (
  path: string,
  origin = window.location.origin
) => {
  return new URL(path, origin).toString();
};

type PopupQueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export const appendQueryParamsToUrl = (
  url: string,
  params: PopupQueryParams
) => {
  const [baseUrl, queryString = ''] = url.split('?');
  const searchParams = new URLSearchParams(queryString);

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    searchParams.set(key, String(value));
  });

  const nextQueryString = searchParams.toString();

  return nextQueryString ? `${baseUrl}?${nextQueryString}` : baseUrl;
};

export const openPopupWindow = ({
  path,
  name,
  features,
  origin,
}: OpenPopupWindowParams): Window | null => {
  const url = buildPopupUrl(path, origin);

  return window.open(url, name, features);
};

export function openPopup(
  url: string,
  title: string,
  width = 1600,
  height = 800
): Window | null {
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  const features = [
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'resizable=yes',
    'scrollbars=yes',
    'status=yes',
    'toolbar=no',
    'menubar=no',
    'location=no',
  ].join(',');

  return window.open(url, title, features);
} 

