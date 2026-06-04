export const FieldRow: React.FC<{ label: string; value?: string | number; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`field-row ${highlight ? 'field-highlight' : ''}`}>
    <span className="field-label">{label}:</span>
    <span className="field-value">{value ?? '—'}</span>
  </div>
);