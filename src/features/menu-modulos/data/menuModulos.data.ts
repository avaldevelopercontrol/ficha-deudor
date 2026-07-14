import { MENU_MODULOS_ROUTES } from '../constants/menuModulosRoutes.constants';
import type { MenuModulo } from '../types';
import { GESTION_USUARIOS_ROUTES } from '@features/gestion-usuarios/constants/gestionUsuariosRoutes.constants';

const PROXIMAMENTE_BADGE = 'Próximamente';

export const MENU_MODULOS: MenuModulo[] = [
  {
    key: 'gestion-cobranza',
    label: 'GESTIÓN DE COBRANZAS',
    descripcion: 'Administra la búsqueda, gestión y seguimiento de deudores.',
    icon: 'dollar-sign',
    badge: 'Disponible',
    children: [
      {
        key: 'gestion-deudor',
        label: 'GESTIÓN DEUDOR',
        breadcrumbLabel: 'GESTIÓN POR PERSONA/DEUDOR',
        descripcion: 'Busca deudores por RUC, DNI o teléfono y accede a su ficha.',
        icon: 'user',
        path: MENU_MODULOS_ROUTES.GESTION_DEUDOR,
        badge: 'Disponible',
      },
      {
        key: 'cartera',
        label: 'CARTERA',
        descripcion: 'Consulta y administración de carteras asignadas.',
        icon: 'briefcase',
        isEnabled: false,
        badge: PROXIMAMENTE_BADGE,
      },
      {
        key: 'estrategia',
        label: 'ESTRATEGIA',
        descripcion: 'Configuración de reglas y estrategias de gestión.',
        icon: 'target',
        isEnabled: false,
        badge: PROXIMAMENTE_BADGE,
      },
      {
        key: 'gestion-cartas',
        label: 'GESTIÓN DE CARTAS',
        descripcion: 'Generación y seguimiento de comunicaciones.',
        icon: 'mail',
        isEnabled: false,
        badge: PROXIMAMENTE_BADGE,
      },
      {
        key: 'gestion-discador',
        label: 'GESTIÓN DISCADOR',
        descripcion: 'Parámetros de campañas telefónicas y discador.',
        icon: 'phone',
        isEnabled: false,
        badge: PROXIMAMENTE_BADGE,
      },
    ],
  },
  {
    key: 'carga-datos',
    label: 'CARGA DE DATOS',
    descripcion: 'Carga y procesamiento de bases para campañas de cobranza.',
    icon: 'database',
    isEnabled: false,
    badge: PROXIMAMENTE_BADGE,
  },
  {
    key: 'gestion-usuarios',
    label: 'GESTIÓN DE USUARIOS',
    descripcion: 'Administración de usuarios, roles y seguridad de acceso.',
    icon: 'users',
    badge: 'Disponible',
    children: [
      {
        key: 'cambiar-clave',
        label: 'CAMBIAR CLAVE',
        descripcion: 'Actualiza la clave de acceso del usuario autenticado.',
        icon: 'key',
        path: GESTION_USUARIOS_ROUTES.CAMBIAR_CLAVE,
        badge: 'Disponible',
      },
      {
        key: 'asignar-usuario',
        label: 'ASIGNAR USUARIO',
        descripcion:
          'Selecciona usuarios para gestionar la asignación de zonas.',
        icon: 'user',
        path:
          GESTION_USUARIOS_ROUTES
            .ASIGNAR_USUARIO,
        badge: 'Disponible',
      },
      {
        key: 'mantener-usuario',
        label: 'MANTENER USUARIO',
        descripcion:
          'Consulta y mantenimiento de los usuarios registrados.',
        icon: 'user',
        path:
          GESTION_USUARIOS_ROUTES
            .MANTENER_USUARIO,
        badge: 'Disponible',
      },
    ],
  },
  {
    key: 'reportes-generales',
    label: 'REPORTES GENERALES',
    descripcion: 'Indicadores, métricas y reportes consolidados.',
    icon: 'bar-chart',
    isEnabled: false,
    badge: PROXIMAMENTE_BADGE,
  },
  {
    key: 'reportes-cliente',
    label: 'REPORTE CLIENTE',
    descripcion: 'Reportes operativos por cliente y campaña.',
    icon: 'file-text',
    isEnabled: false,
    badge: PROXIMAMENTE_BADGE,
  },
  {
    key: 'gestion-movil',
    label: 'GESTIÓN MÓVIL',
    descripcion: 'Gestión de recursos móviles y evidencias de campo.',
    icon: 'smartphone',
    isEnabled: false,
    badge: PROXIMAMENTE_BADGE,
  },
  {
    key: 'produccion-online',
    label: 'PRODUCCIÓN ONLINE',
    descripcion: 'Monitoreo de producción en tiempo real.',
    icon: 'monitor',
    isEnabled: false,
    badge: PROXIMAMENTE_BADGE,
  },
  {
    key: 'parametros-iniciales',
    label: 'PARÁMETROS INICIALES',
    descripcion: 'Configuraciones iniciales y parámetros del sistema.',
    icon: 'sliders',
    isEnabled: false,
    badge: PROXIMAMENTE_BADGE,
  },
];