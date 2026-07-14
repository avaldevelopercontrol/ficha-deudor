import React from 'react';

type InfoRowTone = 'default' | 'danger';

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  title?: string;
  tone?: InfoRowTone;
}

export const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  highlight = false,
  title,
  tone = 'default',
}) => {
  const rowClassName = [
    'compact-row',
    tone === 'danger' ? 'compact-row--danger' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const valueClassName = [
    'compact-value',
    highlight ? 'compact-value--highlight' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rowClassName}>
      <span className="compact-label">
        {label}
      </span>

      <span
        className={valueClassName}
        title={title}
      >
        {value}
      </span>
    </div>
  );
};

interface CompactInfoSectionProps {
  title: string;
  children: React.ReactNode;
}

export const CompactInfoSection: React.FC<
  CompactInfoSectionProps
> = ({
  title,
  children,
}) => (
  <div className="compact-section">
    <div className="compact-section__header">
      {title}
    </div>

    <div className="compact-section__content">
      {children}
    </div>
  </div>
);