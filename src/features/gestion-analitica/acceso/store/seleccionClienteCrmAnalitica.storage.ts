// La selección es global a Gestión Analítica, no por optionId.
// La clave persistida conserva su nombre legacy para no invalidar sesiones existentes.
// Cada opción debe revalidarla contra sus scopes autorizados antes de reutilizarla.
const GESTION_ANALITICA_SELECTED_CRM_CLIENT_STORAGE_KEY =
  'analytics.selectedCrmClientId';

export function getSelectedCrmClientId(): number | null {
  const value = localStorage.getItem(
    GESTION_ANALITICA_SELECTED_CRM_CLIENT_STORAGE_KEY
  );

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

  localStorage.setItem(
    GESTION_ANALITICA_SELECTED_CRM_CLIENT_STORAGE_KEY,
    String(value)
  );
}

export function clearSelectedCrmClientId(): void {
  localStorage.removeItem(
    GESTION_ANALITICA_SELECTED_CRM_CLIENT_STORAGE_KEY
  );
}
