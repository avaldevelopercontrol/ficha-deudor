export const maskPhoneNumber = (
  value: string | number | null | undefined
): string => {
  const digits = String(value ?? '').replace(/\D/g, '');

  if (!digits) {
    return '—';
  }

  if (digits.length <= 3) {
    return '*'.repeat(digits.length);
  }

  const visibleCharacters =
    digits.length > 8 ? 4 : 3;

  const hiddenCharacters =
    digits.length - visibleCharacters;

  return [
    '*'.repeat(hiddenCharacters),
    digits.slice(-visibleCharacters),
  ].join('');
};