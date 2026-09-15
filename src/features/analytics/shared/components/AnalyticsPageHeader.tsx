import type { ReactNode } from 'react';

import '../styles/analytics-primitives.css';

export type AnalyticsPageHeaderVariant = 'default' | 'hero';

interface AnalyticsPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  iconClassName?: string;
  actions?: ReactNode;
  className?: string;
  variant?: AnalyticsPageHeaderVariant;
}

export const AnalyticsPageHeader = ({
  eyebrow,
  title,
  description,
  icon,
  iconClassName = '',
  actions,
  className = '',
  variant = 'default',
}: AnalyticsPageHeaderProps) => (
  <header
    className={[
      'analytics-page-header',
      variant !== 'default' ? `analytics-page-header--${variant}` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <div className="analytics-page-header__headline">
      {icon && (
        <span
          className={`analytics-page-header__icon ${iconClassName}`.trim()}
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <div className="analytics-page-header__copy">
        {eyebrow && <span className="analytics-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </div>

    {actions && (
      <div className="analytics-page-header__actions">
        {actions}
      </div>
    )}
  </header>
);
