export const SectionHeader: React.FC<{ title: string; accent?: boolean }> = ({ title, accent }) => (
  <div className={`section-header ${accent ? 'section-header--accent' : ''}`}>
    <span className="section-title">{title}</span>
  </div>
);