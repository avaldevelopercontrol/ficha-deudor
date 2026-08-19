export interface PowerBiImageDefinition {
  readonly id: string;
  readonly label: string;
  readonly src: string;
}

/**
 * Logos migrados desde el portal de Reportería.
 *
 * La opción persiste únicamente `src` en sImagenOpcion. El catálogo sirve
 * para que administración pueda reutilizar los logos existentes sin conocer
 * rutas de archivos ni modificar código al registrar los BI actuales.
 */
export const POWER_BI_IMAGE_CATALOG:
  readonly PowerBiImageDefinition[] = [
    {
      id: 'americatel',
      label: 'AMERICATEL',
      src: '/imgs_webp/logo-entel.webp',
    },
    {
      id: 'backus-cobranza',
      label: 'BACKUS COBRANZA',
      src: '/imgs_webp/logo-backus.webp',
    },
    {
      id: 'backus-credito',
      label: 'BACKUS CRÉDITO',
      src: '/imgs_webp/logo-backus-cre.webp',
    },
    {
      id: 'elede',
      label: 'ELEDE',
      src: '/imgs_webp/logo-elede-bi.webp',
    },
    {
      id: 'cientifica',
      label: 'CIENTÍFICA',
      src: '/imgs_webp/logo-cientifica-completo.webp',
    },
    {
      id: 'dupree',
      label: 'DUPREE',
      src: '/imgs_webp/logo-azzorti.webp',
    },
    {
      id: 'yanbal',
      label: 'YANBAL',
      src: '/imgs_webp/yanbal_logo.webp',
    },
    {
      id: 'verisure-cobranzas',
      label: 'VERISURE COBRANZAS',
      src: '/imgs_webp/logo-verisure.webp',
    },
    {
      id: 'derrama',
      label: 'DERRAMA',
      src: '/imgs_webp/logo_derrama.webp',
    },
    {
      id: 'openpay',
      label: 'OPENPAY',
      src: '/imgs_webp/logo-openpay.webp',
    },
    {
      id: 'pucp',
      label: 'PUCP',
      src: '/imgs_webp/logo-pucp.webp',
    },
    {
      id: 'adex',
      label: 'ADEX',
      src: '/imgs_webp/adex_logo.webp',
    },
    {
      id: 'claro-corporativo',
      label: 'CLARO CORPORATIVO',
      src: '/imgs_webp/logo-claro-corp.webp',
    },
    {
      id: 'claro-gobierno',
      label: 'CLARO GOBIERNO',
      src: '/imgs_webp/logo-claro-gob.webp',
    },
    {
      id: 'natura',
      label: 'NATURA',
      src: '/imgs_webp/logo-natura.webp',
    },
    {
      id: 'gestion-integral-cobranza',
      label: 'GESTION INTEGRAL DE COBRANZA',
      src: '/imgs_webp/gestion-integral.webp',
    },
    {
      id: 'call-produccion',
      label: 'CALL PRODUCCION',
      src: '/imgs_webp/call-production.webp',
    },
    {
      id: 'gestion-analisis-kpi',
      label: 'GESTION Y ANALISIS DE KPI',
      src: '/imgs_webp/analisis.webp',
    },
    {
      id: 'control-eficiencia-operativa',
      label: 'CONTROL DE EFICIENCIA OPERATIVA',
      src: '/imgs_webp/kpi-eficiencia-operativa.webp',
    },
  ];

export const findPowerBiImageDefinition = (
  value: string
): PowerBiImageDefinition | null => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return null;
  }

  return (
    POWER_BI_IMAGE_CATALOG.find(
      (image) =>
        image.src === normalizedValue
    ) ?? null
  );
};
