export const isValidPopupId = (
  value: unknown
): value is string => {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 128 &&
    value === value.trim() &&
    !value.includes(':')
  );
};
