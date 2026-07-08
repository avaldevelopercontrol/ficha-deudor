export const hasRequiredValues = (
  ...values: Array<string | number | null | undefined>
) => {
  return values.every((value) => String(value ?? '').trim() !== '');
};