/**
 * Identificadores estables de las opciones que ya tienen una pantalla React.
 *
 * Estos valores corresponden a nId_Opcion en la base de datos y son la única
 * llave técnica que debe conectar la configuración dinámica con la
 * implementación React. Nombre, código y ruta jerárquica pueden cambiar desde
 * Mantener módulo sin romper esta asociación.
 */
export const APPLICATION_OPTION_IDS = {
  MANTENER_PERFIL: 10,
  MANTENER_MODULO: 11,
  MANTENER_ACCESOS_POR_PERFIL: 12,
  GESTION_DEUDOR: 13,
  CAMBIAR_CLAVE: 18,
  ASIGNAR_USUARIO: 19,
  MANTENER_USUARIO: 20,
  MANTENER_GRUPO: 21,
  MANTENER_ACCESOS_POR_USUARIO: 22,
  PORTFOLIO_CONTROL_CENTER: 23,
  REPORTERIA: 25,
} as const;

export type ApplicationOptionId =
  (typeof APPLICATION_OPTION_IDS)[keyof typeof APPLICATION_OPTION_IDS];
