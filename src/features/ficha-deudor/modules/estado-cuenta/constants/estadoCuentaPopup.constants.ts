export const ESTADO_CUENTA_POPUP_TEXTS = {
  logoText: 'ESTADO',
  logoSub: 'CUENTA',
  navSection: 'GESTIÓN DE COBRANZAS',
  navActive: 'ESTADO DE CUENTA',

  title: 'Descargar estado de cuenta',
  description:
    'Genera un archivo Excel con la información del estado de cuenta del deudor seleccionado.',

  formatLabel: 'Formato',
  formatValue: 'Microsoft Excel (.xlsx)',

  contentLabel: 'Contenido',
  contentValue:
    'Documentos, fechas, importes, saldos pendientes y estado de las cuentas.',

  downloadButton: 'Descargar Excel',
  downloadingButton: 'Generando archivo...',
  closeButton: 'Cerrar',

  successTitle: 'Descarga completada',
  successMessage:
    'El estado de cuenta se descargó correctamente.',

  errorTitle: 'No se pudo descargar el archivo',
  errorFallback:
    'Ocurrió un error al generar el estado de cuenta. Intente nuevamente.',

  note:
    'La generación del archivo puede tardar algunos segundos dependiendo de la cantidad de registros.',
} as const;

export const ESTADO_CUENTA_EXPORT_CONFIG = {
  pageNumber: 1,
  pageSize: 1000,
} as const;