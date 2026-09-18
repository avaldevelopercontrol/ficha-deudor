import type { ReactNode } from 'react';

import '../styles/analytics-primitives.css';

export type AnalyticsPanelVariant = 'default' | 'integrated';

interface AnalyticsPanelProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  iconClassName?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  variant?: AnalyticsPanelVariant;
  as?: 'section' | 'article';
}

export const AnalyticsPanel = ({
  eyebrow,
  title,
  description,
  icon,
  iconClassName = '',
  actions,
  children,
  className = '',
  headerClassName = '',
  variant = 'default',
  as: Component = 'section',
}: AnalyticsPanelProps) => (
  <Component
    className={[
      'analytics-panel',
      variant !== 'default' ? `analytics-panel--${variant}` : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
  >
    <header className={`analytics-panel__header ${headerClassName}`.trim()}>
      <div className="analytics-panel__heading">
        {eyebrow && <span className="analytics-eyebrow">{eyebrow}</span>}
        <div className="analytics-panel__title-row">
          {icon && (
            <span
              className={`analytics-panel__icon ${iconClassName}`.trim()}
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <h2>{title}</h2>
        </div>
        {description && <p>{description}</p>}
      </div>
      {actions}
    </header>
    {children}
  </Component>
);
