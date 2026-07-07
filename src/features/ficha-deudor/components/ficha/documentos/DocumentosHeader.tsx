interface Props {
  totalRecords: number;
}

const DocumentosHeader: React.FC<Props> = ({ totalRecords }) => {
  return (
    <div className="documentos-header">
      <span className="section-title">DOCUMENTOS A GESTIONAR</span>
      <span style={{ fontSize: '0.85em', color: '#666', marginLeft: 12 }}>
        ({totalRecords} registros)
      </span>
    </div>
  );
};

export default DocumentosHeader;