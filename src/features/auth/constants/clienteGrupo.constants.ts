/**
 * Relación temporal entre el cliente seleccionado y el grupo operativo.
 *
 * Cuando el backend incluya nId_Grupo en la selección de cliente, esta
 * tabla debe eliminarse y la aplicación deberá usar el valor recibido.
 */
export const CLIENTE_GRUPO_TEMPORAL: Readonly<Record<string, number>> = {
  '95': 156,
};
