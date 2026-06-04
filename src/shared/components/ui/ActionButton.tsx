export const ActionButton: React.FC<{ label: string; onClick?: () => void; variant?: string; size?: string; icon?: string }> = ({ label, onClick, variant = 'secondary', size = 'sm', icon }) => (
  <button className={`btn btn-${variant} btn-${size}`} onClick={onClick} type="button">
    {icon && <span className="btn-icon">{icon}</span>}
    {label}
  </button>
);