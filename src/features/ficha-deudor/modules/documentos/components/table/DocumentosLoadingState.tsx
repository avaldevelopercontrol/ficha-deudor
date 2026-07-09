const DocumentosLoadingState = () => {
  return (
    <div
      className="ficha-card"
      style={{ padding: '2rem', textAlign: 'center' }}
    >
      <div
        style={{
          display: 'inline-block',
          width: 20,
          height: 20,
          border: '3px solid #ddd',
          borderTopColor: '#333',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <p style={{ marginTop: 8, color: '#666' }}>Cargando documentos...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default DocumentosLoadingState;