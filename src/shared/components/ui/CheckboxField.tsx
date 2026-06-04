export const CheckboxField: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
  <label className="checkbox-wrapper">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="checkbox-input" />
    <span className="checkbox-label">{label}</span>
  </label>
);