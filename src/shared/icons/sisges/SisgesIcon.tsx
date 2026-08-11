import type React from 'react';
import { normalizeSisgesIconName } from './sisgesIcon.utils';
import type { SisgesIconName } from './sisgesIcon.types';

interface SisgesIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'name'> {
  name: SisgesIconName | string | null | undefined;
  title?: string;
}

const commonProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/*
 * Cada clave del catálogo tiene una geometría propia. Mantener esta relación
 * 1:1 evita que el selector muestre varias opciones visualmente idénticas.
 */
const SISGES_ICON_GLYPHS: Record<SisgesIconName, React.ReactNode> = {
  database: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
    </>
  ),
  'dollar-sign': (
    <>
      <path d="M12 2v20" />
      <path d="M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 21v-1.5a6 6 0 0 1 12 0V21" />
      <path d="M15 15.5a5 5 0 0 1 6 4.9V21" />
    </>
  ),
  'bar-chart': (
    <>
      <path d="M4 20V11" />
      <path d="M10 20V5" />
      <path d="M16 20v-6" />
      <path d="M22 20H2" />
    </>
  ),
  'file-text': (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h6" />
    </>
  ),
  smartphone: (
    <>
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M10 5h4" />
      <circle cx="12" cy="18.5" r=".7" />
    </>
  ),
  monitor: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M2 12h20M10 12v2h4v-2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </>
  ),
  phone: (
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L9 10.6a16 16 0 0 0 4.4 4.4l1.2-1.2a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2.9Z" />
  ),
  user: (
    <>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 22a8 8 0 0 1 16 0" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 8-8M15 8l3 3M17 6l3 3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  'module-default': (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="8" height="7" rx="1" />
      <rect x="13" y="3" width="8" height="4" rx="1" />
      <rect x="13" y="9" width="8" height="12" rx="1" />
      <rect x="3" y="12" width="8" height="9" rx="1" />
    </>
  ),
  'data-management': (
    <>
      <ellipse cx="9" cy="6" rx="6" ry="2.5" />
      <path d="M3 6v9c0 1.4 2.7 2.5 6 2.5 1.1 0 2.1-.1 3-.4" />
      <path d="M3 11c0 1.4 2.7 2.5 6 2.5" />
      <circle cx="17.5" cy="17.5" r="3" />
      <path d="M17.5 12.5v2M17.5 20.5v2M12.5 17.5h2M20.5 17.5h2" />
    </>
  ),
  'database-upload': (
    <>
      <ellipse cx="8" cy="6" rx="5" ry="2" />
      <path d="M3 6v10c0 1.2 2.2 2 5 2 1 0 1.9-.1 2.7-.3" />
      <path d="M3 11c0 1.2 2.2 2 5 2" />
      <path d="M17 20V9m-4 4 4-4 4 4" />
    </>
  ),
  'database-process': (
    <>
      <ellipse cx="8" cy="6" rx="5" ry="2" />
      <path d="M3 6v10c0 1.2 2.2 2 5 2" />
      <path d="M3 11c0 1.2 2.2 2 5 2" />
      <path d="M15 9h5l-2-2M20 9l-2 2" />
      <path d="M20 17h-5l2 2M15 17l2-2" />
    </>
  ),
  'database-download': (
    <>
      <ellipse cx="8" cy="6" rx="5" ry="2" />
      <path d="M3 6v10c0 1.2 2.2 2 5 2 1 0 1.9-.1 2.7-.3" />
      <path d="M3 11c0 1.2 2.2 2 5 2" />
      <path d="M17 8v11m-4-4 4 4 4-4" />
    </>
  ),
  'collection-management': (
    <>
      <circle cx="8" cy="8" r="4" />
      <path d="M8 5v6M10 6.5H7.5a1.5 1.5 0 0 0 0 3H9a1.5 1.5 0 0 1 0 3H6" />
      <path d="M4 19c2-3 6-4 9-2" />
      <path d="m15 18 2 2 4-5" />
    </>
  ),
  'collection-strategy': (
    <>
      <circle cx="10" cy="12" r="7" />
      <circle cx="10" cy="12" r="3" />
      <path d="m14 8 7-5M17 3h4v4" />
    </>
  ),
  portfolio: (
    <>
      <path d="M4 5h6l2 2h8v13H4Z" />
      <path d="M7 11h10M7 15h7" />
    </>
  ),
  'map-zones': (
    <>
      <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z" />
      <path d="M9 3v16M15 5v16" />
      <circle cx="15" cy="10" r="2" />
    </>
  ),
  'debtor-management': (
    <>
      <circle cx="9" cy="7" r="3.5" />
      <path d="M3 20a6 6 0 0 1 11-3.4" />
      <circle cx="18" cy="17" r="4" />
      <path d="M18 14.5v5M20 15.5h-3a1 1 0 0 0 0 2h2a1 1 0 0 1 0 2h-3" />
    </>
  ),
  'unassign-users': (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21a7 7 0 0 1 12-4.9" />
      <path d="m17 17 5 5M22 17l-5 5" />
    </>
  ),
  'letter-management': (
    <>
      <rect x="2" y="5" width="15" height="13" rx="2" />
      <path d="m17 7-7.5 5L2 7" />
      <circle cx="19" cy="18" r="3" />
      <path d="M19 13v2M19 21v2M14 18h2M22 18h2" />
    </>
  ),
  'dialer-management': (
    <>
      <path d="M5 3h7v7H5Z" />
      <path d="M7 5h.01M10 5h.01M7 8h.01M10 8h.01" />
      <path d="M19 14.5v3a2 2 0 0 1-2 2A10 10 0 0 1 8.5 11a2 2 0 0 1 2-2h2l1 3-1.5 1.5a7 7 0 0 0 2.5 2.5l1.5-1.5Z" />
    </>
  ),
  'response-catalog': (
    <>
      <path d="M4 5h16M4 12h10M4 19h7" />
      <circle cx="19" cy="12" r="2" />
      <circle cx="16" cy="19" r="2" />
    </>
  ),
  'altitude-management': (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 14a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v-6H4ZM20 14a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2v-6h2Z" />
    </>
  ),
  'letter-alert': (
    <>
      <rect x="2" y="5" width="16" height="14" rx="2" />
      <path d="m18 7-8 6-8-6" />
      <path d="M21 3v6M21 12v.01" />
    </>
  ),
  'user-management': (
    <>
      <circle cx="8" cy="7" r="3" />
      <circle cx="14" cy="9" r="2.5" />
      <path d="M2 20a6 6 0 0 1 10-4.4" />
      <circle cx="18.5" cy="18.5" r="2.5" />
      <path d="M18.5 14v2M18.5 21v2M14 18.5h2M21 18.5h2" />
    </>
  ),
  'user-settings': (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21a7 7 0 0 1 11-5.7" />
      <circle cx="18" cy="18" r="3" />
      <path d="M18 13v2M18 21v2M13 18h2M21 18h2" />
    </>
  ),
  'user-assignment': (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21a7 7 0 0 1 12-4.9" />
      <path d="m16 19 2 2 4-5" />
    </>
  ),
  'password-change': (
    <>
      <circle cx="7" cy="15" r="3.5" />
      <path d="m10 12 7-7M14 8l3 3" />
      <path d="M19 13a5 5 0 1 1-4 8" />
      <path d="M15 21h4v-4" />
    </>
  ),
  'file-management': (
    <>
      <path d="M2 6h7l2 2h8v10H2Z" />
      <circle cx="18" cy="18" r="3" />
      <path d="M18 13v2M18 21v2M13 18h2M21 18h2" />
    </>
  ),
  'file-upload': (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16h11" />
      <path d="M14 2v6h6v4" />
      <path d="M19 22V14m-3 3 3-3 3 3" />
    </>
  ),
  'scheduled-upload': (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 9h18" />
      <path d="M12 18v-6m-3 3 3-3 3 3" />
    </>
  ),
  'receipt-assignment': (
    <>
      <path d="M6 2h12v20l-3-2-3 2-3-2-3 2Z" />
      <path d="M9 7h6M9 11h6" />
      <path d="m9 15 2 2 4-4" />
    </>
  ),
  'daily-settlement': (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 9h18" />
      <path d="M12 12v6M14 13h-3a1 1 0 0 0 0 2h2a1 1 0 0 1 0 2h-3" />
    </>
  ),
  'file-download': (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16h11" />
      <path d="M14 2v6h6v4" />
      <path d="M19 14v8m-3-3 3 3 3-3" />
    </>
  ),
  'gtelcom-download': (
    <>
      <path d="M4 3h11l4 4v6" />
      <path d="M15 3v5h5" />
      <path d="M4 3v18h8" />
      <path d="M18 14v8m-3-3 3 3 3-3" />
      <path d="M7 11h5" />
    </>
  ),
  'download-center': (
    <>
      <path d="M4 8h16v12H4Z" />
      <path d="M8 8V5h8v3" />
      <path d="M12 4v10m-3-3 3 3 3-3" />
      <path d="M8 17h8" />
    </>
  ),
  'general-reports': (
    <>
      <path d="M5 2h10l4 4v16H5Z" />
      <path d="M15 2v5h5" />
      <path d="M9 18v-4M13 18v-7M17 18v-3" />
    </>
  ),
  'priority-management': (
    <>
      <path d="M4 5h10M4 10h7M4 15h5" />
      <path d="m17 5 1.2 2.5L21 8l-2 2 .5 3-2.5-1.4-2.5 1.4.5-3-2-2 2.8-.5Z" />
      <path d="M4 20h12" />
    </>
  ),
  'effectiveness-report': (
    <>
      <path d="m3 17 6-6 4 4 8-9" />
      <path d="M15 6h6v6" />
    </>
  ),
  'identity-search': (
    <>
      <rect x="3" y="4" width="13" height="16" rx="2" />
      <circle cx="9.5" cy="9" r="2" />
      <path d="M6 15h7" />
      <circle cx="18" cy="16" r="3" />
      <path d="m20.5 18.5 2 2" />
    </>
  ),
  'client-reports': (
    <>
      <path d="M5 2h11l3 3v17H5Z" />
      <circle cx="10" cy="9" r="2" />
      <path d="M7 15a3 3 0 0 1 6 0" />
      <path d="M15 12h2M15 16h2" />
    </>
  ),
  'field-daily-report': (
    <>
      <path d="M6 3h12v18H6Z" />
      <path d="M9 3V1h6v2" />
      <path d="M16 10c0 2.5-4 6-4 6s-4-3.5-4-6a4 4 0 1 1 8 0Z" />
      <circle cx="12" cy="10" r="1" />
    </>
  ),
  'call-daily-report': (
    <>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 9h18" />
      <path d="M9 13c1 3 3 5 6 6l1-2 2 1" />
    </>
  ),
  'ladder-report': (
    <>
      <path d="M3 20h5v-5h5v-5h5V5h3" />
      <path d="M3 4v16h18" />
    </>
  ),
  reports: (
    <>
      <path d="M6 3h12v18H6Z" />
      <path d="M9 3V1h6v2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  'mobile-management': (
    <>
      <rect x="4" y="2" width="12" height="20" rx="2" />
      <circle cx="19" cy="17" r="3" />
      <path d="M19 12v2M19 20v2M14 17h2M22 17h2" />
    </>
  ),
  'image-management': (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-5-5L5 21" />
    </>
  ),
  services: (
    <>
      <path d="m14 6 4-4 4 4-4 4" />
      <path d="M18 6h-7a5 5 0 0 0-5 5v1" />
      <path d="m10 18-4 4-4-4 4-4" />
      <path d="M6 18h7a5 5 0 0 0 5-5v-1" />
    </>
  ),
  'online-production': (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M6 11h3l2-4 3 7 2-3h2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  'predictive-dialer': (
    <>
      <path d="M5 16a12 12 0 0 0 8 6l2-3-2-2 2-2 3 2 2-2a12 12 0 0 0-4-8" />
      <path d="M12 2a8 8 0 0 1 8 8" />
      <path d="m17 7 3 3 3-3" />
    </>
  ),
  'progressive-dialer': (
    <>
      <path d="M4 18h4v3H4ZM10 14h4v7h-4ZM16 9h4v12h-4Z" />
      <path d="M5 5c3 0 5 1 7 3l2-2 3 3-2 2c1 2 2 4 2 6" />
    </>
  ),
  'initial-settings': (
    <>
      <path d="M4 6h16M4 12h16M4 18h16" />
      <circle cx="8" cy="6" r="2" />
      <circle cx="16" cy="12" r="2" />
      <circle cx="10" cy="18" r="2" />
    </>
  ),
  security: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <rect x="9" y="10" width="6" height="5" rx="1" />
      <path d="M10 10V8a2 2 0 0 1 4 0v2" />
    </>
  ),
  permissions: (
    <>
      <path d="M5 3h14v18H5Z" />
      <path d="m8 8 1.5 1.5L12 7" />
      <path d="M14 9h2" />
      <path d="m8 14 1.5 1.5L12 13" />
      <path d="M14 15h2" />
    </>
  ),
  'user-group-access': (
    <>
      <circle cx="8" cy="7" r="3" />
      <path d="M2.5 17a5.5 5.5 0 0 1 10-3.2" />
      <path d="M17 22s5-2.5 5-6.5V12l-5-2-5 2v3.5c0 4 5 6.5 5 6.5Z" />
      <path d="m15 16 1.5 1.5L19 15" />
    </>
  ),
  profiles: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="3" />
      <path d="M5.5 17a3.5 3.5 0 0 1 7 0" />
      <path d="M15 8h3M15 12h3M15 16h2" />
    </>
  ),
  groups: (
    <>
      <circle cx="12" cy="7" r="3" />
      <circle cx="5" cy="10" r="2.5" />
      <circle cx="19" cy="10" r="2.5" />
      <path d="M7 21v-1.5a5 5 0 0 1 10 0V21" />
      <path d="M1.5 21v-1a4 4 0 0 1 5.5-3.7M22.5 21v-1a4 4 0 0 0-5.5-3.7" />
    </>
  ),
  modules: (
    <>
      <rect x="3" y="3" width="6" height="5" rx="1" />
      <rect x="15" y="3" width="6" height="5" rx="1" />
      <rect x="9" y="16" width="6" height="5" rx="1" />
      <path d="M6 8v4h12V8M12 12v4" />
    </>
  ),
  search: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="m15 15 6 6" />
    </>
  ),
  filter: <path d="M3 4h18l-7 8v6l-4 2v-8Z" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
      <path d="M8 14h2M12 14h2M16 14h1M8 18h2M12 18h2" />
    </>
  ),
  history: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5M12 7v5l3 2" />
    </>
  ),
  audit: (
    <>
      <path d="M9 2h6l1 3h4v17H4V5h4Z" />
      <path d="M9 12h6M9 16h4" />
      <path d="m9 8 1 1 2-2" />
    </>
  ),
  notification: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3 2 21h20Z" />
      <path d="M12 9v5M12 18v.01" />
    </>
  ),
  success: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m7 12 3 3 7-7" />
    </>
  ),
  error: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m8 8 8 8M16 8l-8 8" />
    </>
  ),
  location: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  document: (
    <>
      <path d="M6 2h9l4 4v16H6Z" />
      <path d="M15 2v5h5" />
      <path d="M9 12h7M9 16h7" />
    </>
  ),
  folder: <path d="M3 5h7l2 2h9v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />,
  download: (
    <>
      <path d="M12 3v13" />
      <path d="m7 11 5 5 5-5" />
      <path d="M4 21h16" />
    </>
  ),
  upload: (
    <>
      <path d="M12 21V8" />
      <path d="m7 13 5-5 5 5" />
      <path d="M4 3h16" />
    </>
  ),
  export: (
    <>
      <path d="M10 5H4v15h15v-6" />
      <path d="M13 3h8v8M21 3l-9 9" />
    </>
  ),
  import: (
    <>
      <path d="M14 5h6v15H5v-6" />
      <path d="M3 3h8v8M3 3l9 9" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3A1.7 1.7 0 0 0 14 21v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  automation: (
    <>
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <path d="M8 6h8M6 8v8M18 8v8M8 18h8" />
      <path d="m10 12 2 2 3-4" />
    </>
  ),
  integration: (
    <>
      <path d="M8 12h8M12 8v8" />
      <circle cx="5" cy="12" r="3" />
      <circle cx="19" cy="12" r="3" />
      <circle cx="12" cy="5" r="3" />
      <circle cx="12" cy="19" r="3" />
    </>
  ),
  analytics: (
    <>
      <path d="M3 20h18M5 17l5-6 4 3 5-8" />
      <circle cx="5" cy="17" r="1" />
      <circle cx="10" cy="11" r="1" />
      <circle cx="14" cy="14" r="1" />
      <circle cx="19" cy="6" r="1" />
    </>
  ),
  money: (
    <>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <path d="M6 9H5v2M18 15h1v-2" />
    </>
  ),
  payments: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </>
  ),
  customer: (
    <>
      <circle cx="10" cy="7" r="3.5" />
      <path d="M3 21a7 7 0 0 1 13-3.5" />
      <path d="M17 13h5v6h-5Z" />
      <path d="M18.5 13v-1a1 1 0 0 1 2 0v1" />
    </>
  ),
  agent: (
    <>
      <circle cx="11" cy="8" r="4" />
      <path d="M4 19a7 7 0 0 1 14 0" />
      <path d="M5 9v-1a6 6 0 0 1 12 0v1M5 9H3v4h3M17 9h2v4h-3" />
      <path d="M16 15h-3" />
    </>
  ),
  campaign: (
    <>
      <path d="m3 11 14-6v14L3 13Z" />
      <path d="M7 14v5h4v-3" />
      <path d="M20 9v6" />
    </>
  ),
};

export const SisgesIcon: React.FC<SisgesIconProps> = ({
  name,
  title,
  width = 24,
  height = 24,
  ...svgProps
}) => {
  const normalizedName = normalizeSisgesIconName(name);

  return (
    <svg
      {...commonProps}
      {...svgProps}
      width={width}
      height={height}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {SISGES_ICON_GLYPHS[normalizedName]}
    </svg>
  );
};

export default SisgesIcon;
