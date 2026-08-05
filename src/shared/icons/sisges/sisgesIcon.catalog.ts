import type {
  SisgesIconCategory,
  SisgesIconDefinition,
  SisgesIconName,
} from './sisgesIcon.types';

const defineIcon = (
  name: SisgesIconName,
  label: string,
  category: SisgesIconCategory,
  keywords: readonly string[],
  legacy = false
): SisgesIconDefinition => ({
  name,
  label,
  category,
  keywords,
  legacy,
});

export const SISGES_ICON_CATALOG: readonly SisgesIconDefinition[] = [
  defineIcon('database', 'Base de datos', 'existentes', ['datos', 'base'], true),
  defineIcon('dollar-sign', 'Dinero', 'existentes', ['dinero', 'cobranza'], true),
  defineIcon('users', 'Usuarios', 'existentes', ['usuarios', 'personas'], true),
  defineIcon('bar-chart', 'Gráfico de barras', 'existentes', ['reporte', 'gráfico'], true),
  defineIcon('file-text', 'Documento', 'existentes', ['archivo', 'documento'], true),
  defineIcon('smartphone', 'Teléfono móvil', 'existentes', ['móvil', 'celular'], true),
  defineIcon('monitor', 'Monitor', 'existentes', ['sistema', 'pantalla'], true),
  defineIcon('briefcase', 'Cartera', 'existentes', ['cartera', 'portafolio'], true),
  defineIcon('target', 'Objetivo', 'existentes', ['estrategia', 'meta'], true),
  defineIcon('mail', 'Correo', 'existentes', ['correo', 'carta'], true),
  defineIcon('phone', 'Teléfono', 'existentes', ['llamada', 'discador'], true),
  defineIcon('user', 'Usuario', 'existentes', ['persona', 'usuario'], true),
  defineIcon('key', 'Clave', 'existentes', ['contraseña', 'acceso'], true),
  defineIcon('shield', 'Escudo', 'existentes', ['seguridad', 'protección'], true),

  defineIcon('module-default', 'Módulo genérico', 'generales', ['módulo', 'opción', 'general']),
  defineIcon('dashboard', 'Panel principal', 'generales', ['inicio', 'dashboard', 'panel']),
  defineIcon('data-management', 'Gestión de datos', 'datos', ['datos', 'base', 'gestión']),
  defineIcon('database-upload', 'Carga de base', 'datos', ['carga', 'base', 'importar']),
  defineIcon('database-process', 'Procesar base', 'datos', ['procesar', 'base', 'flujo']),
  defineIcon('database-download', 'Descarga de base', 'datos', ['descarga', 'base', 'exportar']),

  defineIcon('collection-management', 'Gestión de cobranza', 'cobranza', ['cobranza', 'gestión', 'dinero']),
  defineIcon('collection-strategy', 'Estrategia de cobranza', 'cobranza', ['estrategia', 'meta', 'objetivo']),
  defineIcon('portfolio', 'Cartera', 'cobranza', ['cartera', 'cuentas', 'portafolio']),
  defineIcon('map-zones', 'Zonas', 'cobranza', ['zona', 'mapa', 'ubicación']),
  defineIcon('debtor-management', 'Gestión de deudor', 'cobranza', ['deudor', 'cliente', 'gestión']),
  defineIcon('unassign-users', 'Desasignar gestores', 'cobranza', ['borrar', 'asignación', 'gestor']),
  defineIcon('letter-management', 'Gestión de cartas', 'cobranza', ['carta', 'documento', 'envío']),
  defineIcon('dialer-management', 'Gestión de discador', 'comunicaciones', ['discador', 'llamada', 'teléfono']),
  defineIcon('response-catalog', 'Paleta de respuestas', 'cobranza', ['respuesta', 'catálogo', 'paleta']),
  defineIcon('altitude-management', 'Gestión Altitude', 'comunicaciones', ['altitude', 'call center', 'auriculares']),
  defineIcon('letter-alert', 'Alerta de cartas', 'cobranza', ['alerta', 'carta', 'notificación']),

  defineIcon('user-management', 'Gestión de usuarios', 'usuarios', ['usuarios', 'gestión', 'personas']),
  defineIcon('user-settings', 'Mantener usuario', 'usuarios', ['usuario', 'editar', 'configurar']),
  defineIcon('user-assignment', 'Asignar usuario', 'usuarios', ['usuario', 'asignar', 'vincular']),
  defineIcon('password-change', 'Cambiar clave', 'usuarios', ['clave', 'contraseña', 'seguridad']),

  defineIcon('file-management', 'Gestión de archivos', 'archivos', ['archivo', 'carpeta', 'gestión']),
  defineIcon('file-upload', 'Carga de archivos', 'archivos', ['archivo', 'carga', 'subir']),
  defineIcon('scheduled-upload', 'Horario de carga', 'archivos', ['horario', 'carga', 'calendario']),
  defineIcon('receipt-assignment', 'Asignar comprobantes', 'archivos', ['comprobante', 'asignar', 'recibo']),
  defineIcon('daily-settlement', 'Liquidación diaria', 'archivos', ['liquidación', 'diaria', 'dinero']),
  defineIcon('file-download', 'Descargar archivo', 'archivos', ['archivo', 'descargar']),
  defineIcon('gtelcom-download', 'Descargar NC GTELCOM', 'archivos', ['gtelcom', 'nota de crédito', 'descarga']),
  defineIcon('download-center', 'Centro de descargas', 'archivos', ['descargas', 'archivos', 'centro']),

  defineIcon('general-reports', 'Reportes generales', 'reportes', ['reporte', 'general', 'gráfico']),
  defineIcon('priority-management', 'Gestión prioritaria', 'reportes', ['prioridad', 'alerta', 'gestión']),
  defineIcon('effectiveness-report', 'Reporte de efectividad', 'reportes', ['efectividad', 'reporte', 'tendencia']),
  defineIcon('identity-search', 'Consulta RENIEC', 'reportes', ['reniec', 'identidad', 'consulta']),
  defineIcon('client-reports', 'Reportes de cliente', 'reportes', ['cliente', 'reporte', 'documento']),
  defineIcon('field-daily-report', 'Gestión diaria de campo', 'reportes', ['campo', 'diario', 'ubicación']),
  defineIcon('call-daily-report', 'Gestión diaria de llamadas', 'reportes', ['llamada', 'diario', 'teléfono']),
  defineIcon('ladder-report', 'Reporte escalera', 'reportes', ['escalera', 'niveles', 'reporte']),
  defineIcon('reports', 'Reportes', 'reportes', ['reporte', 'panel', 'analítica']),

  defineIcon('mobile-management', 'Gestión móvil', 'movil', ['móvil', 'celular', 'gestión']),
  defineIcon('image-management', 'Gestión de imágenes', 'movil', ['imagen', 'foto', 'galería']),

  defineIcon('services', 'Servicios', 'servicios', ['servicio', 'herramienta', 'proceso']),
  defineIcon('online-production', 'Producción online', 'servicios', ['producción', 'online', 'monitor']),
  defineIcon('predictive-dialer', 'GTELCOM predictivo', 'comunicaciones', ['gtelcom', 'predictivo', 'discador']),
  defineIcon('progressive-dialer', 'GTELCOM progresivo', 'comunicaciones', ['gtelcom', 'progresivo', 'discador']),
  defineIcon('initial-settings', 'Parámetros iniciales', 'servicios', ['parámetros', 'inicio', 'configuración']),

  defineIcon('security', 'Seguridad', 'seguridad', ['seguridad', 'escudo', 'protección']),
  defineIcon('permissions', 'Permisos', 'seguridad', ['permisos', 'accesos', 'check']),
  defineIcon('profiles', 'Perfiles', 'seguridad', ['perfil', 'rol', 'usuarios']),
  defineIcon('modules', 'Módulos', 'seguridad', ['módulos', 'opciones', 'jerarquía']),

  defineIcon('search', 'Buscar', 'generales', ['buscar', 'consulta', 'lupa']),
  defineIcon('filter', 'Filtrar', 'generales', ['filtro', 'buscar', 'segmentar']),
  defineIcon('calendar', 'Calendario', 'generales', ['fecha', 'calendario', 'agenda']),
  defineIcon('history', 'Historial', 'generales', ['historial', 'tiempo', 'registro']),
  defineIcon('audit', 'Auditoría', 'seguridad', ['auditoría', 'revisión', 'trazabilidad']),
  defineIcon('notification', 'Notificación', 'generales', ['notificación', 'campana', 'alerta']),
  defineIcon('warning', 'Advertencia', 'generales', ['advertencia', 'alerta', 'riesgo']),
  defineIcon('success', 'Correcto', 'generales', ['éxito', 'correcto', 'check']),
  defineIcon('error', 'Error', 'generales', ['error', 'cerrar', 'fallo']),
  defineIcon('location', 'Ubicación', 'generales', ['ubicación', 'mapa', 'dirección']),
  defineIcon('document', 'Documento', 'archivos', ['documento', 'archivo', 'texto']),
  defineIcon('folder', 'Carpeta', 'archivos', ['carpeta', 'archivo', 'directorio']),
  defineIcon('download', 'Descargar', 'archivos', ['descargar', 'archivo', 'bajar']),
  defineIcon('upload', 'Subir', 'archivos', ['subir', 'archivo', 'cargar']),
  defineIcon('export', 'Exportar', 'archivos', ['exportar', 'salida', 'archivo']),
  defineIcon('import', 'Importar', 'archivos', ['importar', 'entrada', 'archivo']),
  defineIcon('settings', 'Configuración', 'servicios', ['configuración', 'ajustes', 'engranaje']),
  defineIcon('automation', 'Automatización', 'servicios', ['automatización', 'flujo', 'proceso']),
  defineIcon('integration', 'Integración', 'servicios', ['integración', 'conexión', 'sistemas']),
  defineIcon('analytics', 'Analítica', 'reportes', ['analítica', 'gráfico', 'medición']),
  defineIcon('money', 'Dinero', 'cobranza', ['dinero', 'pago', 'cobranza']),
  defineIcon('payments', 'Pagos', 'cobranza', ['pago', 'tarjeta', 'dinero']),
  defineIcon('customer', 'Cliente', 'usuarios', ['cliente', 'persona', 'empresa']),
  defineIcon('agent', 'Gestor', 'usuarios', ['gestor', 'agente', 'usuario']),
  defineIcon('campaign', 'Campaña', 'cobranza', ['campaña', 'megáfono', 'estrategia']),
] as const;

export const SISGES_ICON_BY_NAME = new Map<SisgesIconName, SisgesIconDefinition>(
  SISGES_ICON_CATALOG.map((icon) => [icon.name, icon])
);

export const SISGES_ICON_CATALOG_BY_CATEGORY = SISGES_ICON_CATALOG.reduce(
  (catalog, icon) => {
    catalog[icon.category].push(icon);
    return catalog;
  },
  {
    existentes: [],
    datos: [],
    cobranza: [],
    usuarios: [],
    archivos: [],
    reportes: [],
    movil: [],
    comunicaciones: [],
    servicios: [],
    seguridad: [],
    generales: [],
  } as Record<SisgesIconCategory, SisgesIconDefinition[]>
);
