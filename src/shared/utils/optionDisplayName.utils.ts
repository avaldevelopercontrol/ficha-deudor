const OPTION_DISPLAY_NAMES_BY_CODE = {
  mmantenergrupo: 'Mantener grupo',
  mmanteneraccesosporusuario:
    'Mantener accesos por usuario',
} as const;

const normalizeOptionCode = (
  optionCode: string
): string =>
  optionCode
    .trim()
    .toLocaleLowerCase('es-PE');

/**
 * Centraliza las correcciones de presentación de nombres de opciones
 * mientras el catálogo del backend conserva etiquetas históricas.
 */
export const getOptionDisplayName = (
  optionCode: string,
  optionName: string
): string =>
  OPTION_DISPLAY_NAMES_BY_CODE[
    normalizeOptionCode(
      optionCode
    ) as keyof typeof OPTION_DISPLAY_NAMES_BY_CODE
  ] ?? optionName.trim();
