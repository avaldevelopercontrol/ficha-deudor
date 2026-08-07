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

const renderIcon = (name: SisgesIconName): React.ReactNode => {
  switch (name) {
    case 'database':
    case 'data-management':
      return <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/></>;
    case 'database-upload':
    case 'file-upload':
    case 'upload':
    case 'import':
      return <><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M5 20h14"/></>;
    case 'database-download':
    case 'file-download':
    case 'gtelcom-download':
    case 'download-center':
    case 'download':
    case 'export':
      return <><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></>;
    case 'database-process':
    case 'automation':
      return <><path d="M4 7h12"/><path d="m13 4 3 3-3 3"/><path d="M20 17H8"/><path d="m11 14-3 3 3 3"/><circle cx="5" cy="17" r="2"/><circle cx="19" cy="7" r="2"/></>;
    case 'dollar-sign':
    case 'money':
    case 'collection-management':
      return <><path d="M12 1v22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>;
    case 'payments':
      return <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></>;
    case 'users':
    case 'user-management':
    case 'profiles':
      return <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></>;
    case 'groups':
      return <><circle cx="12" cy="7" r="3"/><circle cx="5" cy="10" r="2.5"/><circle cx="19" cy="10" r="2.5"/><path d="M7 21v-1.5a5 5 0 0 1 10 0V21"/><path d="M1.5 21v-1a4 4 0 0 1 5.5-3.7"/><path d="M22.5 21v-1a4 4 0 0 0-5.5-3.7"/></>;
    case 'user':
    case 'customer':
    case 'agent':
    case 'debtor-management':
      return <><circle cx="12" cy="7" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/></>;
    case 'user-settings':
      return <><circle cx="9" cy="7" r="4"/><path d="M2 21a7 7 0 0 1 11-5.7"/><circle cx="18" cy="18" r="3"/><path d="M18 13v2M18 21v2M13 18h2M21 18h2"/></>;
    case 'user-assignment':
      return <><circle cx="9" cy="7" r="4"/><path d="M2 21a7 7 0 0 1 12-4.9"/><path d="m16 19 2 2 4-5"/></>;
    case 'unassign-users':
      return <><circle cx="9" cy="7" r="4"/><path d="M2 21a7 7 0 0 1 12-4.9"/><path d="m17 17 5 5M22 17l-5 5"/></>;
    case 'bar-chart':
    case 'general-reports':
    case 'reports':
    case 'analytics':
      return <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>;
    case 'effectiveness-report':
      return <><path d="m3 17 6-6 4 4 8-9"/><path d="M15 6h6v6"/></>;
    case 'ladder-report':
      return <><path d="M3 20h5v-5h5v-5h5V5h3"/><path d="M3 4v16h18"/></>;
    case 'file-text':
    case 'document':
    case 'client-reports':
      return <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8"/></>;
    case 'folder':
    case 'file-management':
      return <path d="M3 5h7l2 2h9v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/>;
    case 'receipt-assignment':
      return <><path d="M6 2h12v20l-3-2-3 2-3-2-3 2Z"/><path d="M9 7h6M9 11h6"/><path d="m9 15 2 2 4-4"/></>;
    case 'smartphone':
    case 'mobile-management':
      return <><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M10 18h4"/></>;
    case 'image-management':
      return <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></>;
    case 'monitor':
    case 'online-production':
    case 'dashboard':
      return <><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>;
    case 'briefcase':
    case 'portfolio':
      return <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M2 12h20"/></>;
    case 'target':
    case 'collection-strategy':
      return <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>;
    case 'mail':
    case 'letter-management':
      return <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/></>;
    case 'letter-alert':
      return <><rect x="2" y="5" width="16" height="14" rx="2"/><path d="m18 7-8 6-8-6"/><path d="M21 3v6M21 12v.01"/></>;
    case 'phone':
    case 'dialer-management':
    case 'predictive-dialer':
    case 'progressive-dialer':
      return <><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L9 10.6a16 16 0 0 0 4.4 4.4l1.2-1.2a2 2 0 0 1 2.1-.4c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2.9Z"/><path d="M15 3h6v6"/></>;
    case 'altitude-management':
      return <><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v-6H4ZM20 14a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2v-6h2Z"/></>;
    case 'key':
    case 'password-change':
      return <><circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M15 8l3 3M17 6l3 3"/></>;
    case 'shield':
    case 'security':
    case 'permissions':
      return <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>;
    case 'map-zones':
    case 'location':
    case 'field-daily-report':
      return <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>;
    case 'response-catalog':
      return <><path d="M4 5h16M4 12h10M4 19h7"/><circle cx="19" cy="12" r="2"/><circle cx="16" cy="19" r="2"/></>;
    case 'scheduled-upload':
    case 'calendar':
    case 'daily-settlement':
    case 'call-daily-report':
      return <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 15h3M13 15h3"/></>;
    case 'priority-management':
    case 'warning':
      return <><path d="M12 3 2 21h20Z"/><path d="M12 9v5M12 18v.01"/></>;
    case 'identity-search':
    case 'search':
      return <><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/><path d="M7 10h6M10 7v6"/></>;
    case 'services':
    case 'settings':
    case 'initial-settings':
      return <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>;
    case 'modules':
    case 'module-default':
      return <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>;
    case 'filter':
      return <path d="M3 4h18l-7 8v6l-4 2v-8Z"/>;
    case 'history':
      return <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>;
    case 'audit':
      return <><path d="M9 2h6l1 3h4v17H4V5h4Z"/><path d="M9 12h6M9 16h4"/><path d="m9 8 1 1 2-2"/></>;
    case 'notification':
      return <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>;
    case 'success':
      return <><circle cx="12" cy="12" r="10"/><path d="m7 12 3 3 7-7"/></>;
    case 'error':
      return <><circle cx="12" cy="12" r="10"/><path d="m8 8 8 8M16 8l-8 8"/></>;
    case 'integration':
      return <><path d="M8 12h8M12 8v8"/><circle cx="5" cy="12" r="3"/><circle cx="19" cy="12" r="3"/><circle cx="12" cy="5" r="3"/><circle cx="12" cy="19" r="3"/></>;
    case 'campaign':
      return <><path d="m3 11 14-6v14L3 13Z"/><path d="M7 14v5h4v-3"/><path d="M20 9v6"/></>;
  }
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
      {renderIcon(normalizedName)}
    </svg>
  );
};

export default SisgesIcon;
