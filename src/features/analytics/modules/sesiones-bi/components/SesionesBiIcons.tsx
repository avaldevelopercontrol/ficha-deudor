import type { ReactNode } from 'react';

interface IconProps {
  size?: number;
}

const Icon = ({ children, size = 18 }: IconProps & { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const ActivityIcon = ({ size }: IconProps) => (
  <Icon size={size}>
    <path d="M3 12h4l2.2-6 4.3 12 2.2-6H21" />
  </Icon>
);

export const SessionsIcon = ({ size }: IconProps) => (
  <Icon size={size}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="M8 9h8M8 13h5M8 17h3" />
  </Icon>
);

export const UsersIcon = ({ size }: IconProps) => (
  <Icon size={size}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
    <circle cx="9.5" cy="7" r="4" />
    <path d="M17 11a4 4 0 0 1 4 4v2" />
    <path d="M16 3.2a4 4 0 0 1 0 7.6" />
  </Icon>
);

export const ClockIcon = ({ size }: IconProps) => (
  <Icon size={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

export const GaugeIcon = ({ size }: IconProps) => (
  <Icon size={size}>
    <path d="M4 18a8 8 0 1 1 16 0" />
    <path d="m12 14 4-4" />
    <path d="M6.5 14H5M19 14h-1.5M12 6.5V5" />
  </Icon>
);

export const RefreshIcon = ({ size }: IconProps) => (
  <Icon size={size}>
    <path d="M20 7v5h-5" />
    <path d="M4 17v-5h5" />
    <path d="M6.1 9a7 7 0 0 1 11.6-2L20 9M4 15l2.3 2a7 7 0 0 0 11.6-2" />
  </Icon>
);

export const SearchIcon = ({ size }: IconProps) => (
  <Icon size={size}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </Icon>
);

export const ChevronRightIcon = ({ size }: IconProps) => (
  <Icon size={size}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
);

export const CloseIcon = ({ size }: IconProps) => (
  <Icon size={size}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const MonitorIcon = ({ size }: IconProps) => (
  <Icon size={size}>
    <rect x="3" y="4" width="18" height="13" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </Icon>
);
