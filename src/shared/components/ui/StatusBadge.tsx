export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getVariant = (s: string) => {
    const upper = s.toUpperCase();
    if (['VENCIDO', 'IMPAGO', 'MORA', 'PREJUDICIAL'].includes(upper)) return 'danger';
    if (['PAGADO', 'AL DIA'].includes(upper)) return 'success';
    if (['PROMESA', 'EN_PROCESO', 'EN PROCESO'].includes(upper)) return 'warning';
    return 'neutral';
  };
  return <span className={`status-badge status-badge--${getVariant(status)}`}>{status}</span>;
};