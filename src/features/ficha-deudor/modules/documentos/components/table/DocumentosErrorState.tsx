interface Props {
  error: string;
  onRetry: () => void;
}

const DocumentosErrorState: React.FC<Props> = ({ error, onRetry }) => {
  return (
    <div className="ficha-card" style={{ padding: '2rem', color: '#c00' }}>
      <p style={{ marginBottom: 12 }}>Error al cargar documentos:</p>
      <p style={{ fontSize: '0.9em', color: '#666', marginBottom: 16 }}>
        {error}
      </p>
      <button
        onClick={onRetry}
        style={{ padding: '8px 16px', cursor: 'pointer' }}
      >
        Reintentar
      </button>
    </div>
  );
};

export default DocumentosErrorState;