import React from 'react';

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  title?: string;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value, highlight = false, title }) => (
  <div className="compact-row">
    <span className="compact-label">{label}</span>
    <span className={`compact-value${highlight ? ' compact-value--highlight' : ''}`} title={title}>
      {value}
    </span>
  </div>
);

interface CompactInfoSectionProps {
  title: string;
  children: React.ReactNode;
}

export const CompactInfoSection: React.FC<CompactInfoSectionProps> = ({ title, children }) => (
  <div className="compact-section">
    <div className="compact-section__header">{title}</div>
    <div className="compact-section__content">{children}</div>
  </div>
);