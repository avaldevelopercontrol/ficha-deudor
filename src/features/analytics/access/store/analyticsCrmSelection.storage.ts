const KEY = 'analytics.selectedCrmClientId';

export function getSelectedCrmClientId(): number | null {
  const value = localStorage.getItem(KEY);

  if (!value) {
    return null;
  }

  const crmClientId = Number(value);

  return Number.isSafeInteger(crmClientId) &&
    crmClientId > 0
    ? crmClientId
    : null;
}

export function setSelectedCrmClientId(value: number): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error('crmClientId debe ser un entero positivo.');
  }

  localStorage.setItem(KEY, String(value));
}

export function clearSelectedCrmClientId(): void {
  localStorage.removeItem(KEY);
}
