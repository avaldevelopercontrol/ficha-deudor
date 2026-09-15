/**
 * Políticas excepcionales de acceso/navegación para Reportería.
 *
 * El reporte "GESTION INTEGRAL DE COBRANZA - SUPERVISOR" (opción SISGES 27)
 * no debe quedar bloqueado por el grupo Analytics asociado al Power BI. El
 * permiso `consultar` de SISGES sigue siendo obligatorio porque el reporte
 * solo llega al catálogo desde el menú autorizado.
 *
 * Aunque omite esa validación de grupo, el reporte sí trabaja por cartera y
 * debe pedir una selección explícita antes de abrir el visor. La publicación
 * concreta se resuelve posteriormente con la cartera seleccionada.
 */
export const REPORTERIA_REPORT_IDS = {
  GESTION_INTEGRAL_COBRANZA_SUPERVISOR: 27,
} as const;

export const bypassesAnalyticsGroupAccess = (
  optionId: number
): boolean =>
  optionId ===
  REPORTERIA_REPORT_IDS.GESTION_INTEGRAL_COBRANZA_SUPERVISOR;

export const requiresExplicitClientSelection = (
  optionId: number
): boolean =>
  optionId ===
  REPORTERIA_REPORT_IDS.GESTION_INTEGRAL_COBRANZA_SUPERVISOR;
