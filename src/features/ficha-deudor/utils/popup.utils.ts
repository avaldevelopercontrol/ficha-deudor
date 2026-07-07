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