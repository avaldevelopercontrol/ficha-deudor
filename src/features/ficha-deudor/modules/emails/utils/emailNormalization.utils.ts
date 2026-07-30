export const normalizeEmailForComparison = (
  value: string | null | undefined
): string => {
  return String(value ?? '')
    .trim()
    .toLowerCase();
};