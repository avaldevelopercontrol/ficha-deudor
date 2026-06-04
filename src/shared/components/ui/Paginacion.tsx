import React from 'react';

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  indiceInicio: number;
  indiceFin: number;
  onPaginaAnterior: () => void;
  onPaginaSiguiente: () => void;
  onIrAPagina: (pagina: number) => void;
  // Nuevas props opcionales
  showPageSizeSelector?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (newSize: number) => void;
}

const Paginacion: React.FC<PaginacionProps> = ({
  paginaActual,
  totalPaginas,
  totalRegistros,
  indiceInicio,
  indiceFin,
  onPaginaAnterior,
  onPaginaSiguiente,
  onIrAPagina,
  showPageSizeSelector = false,
  pageSize = 5,
  pageSizeOptions = [5, 10, 30, 50],
  onPageSizeChange,
}) => {
  const getPaginasVisibles = () => {
    const paginas: (number | string)[] = [];
    const maxBotones = 5;

    if (totalPaginas <= maxBotones) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else {
      if (paginaActual <= 3) {
        for (let i = 1; i <= 4; i++) paginas.push(i);
        paginas.push('...');
        paginas.push(totalPaginas);
      } else if (paginaActual >= totalPaginas - 2) {
        paginas.push(1);
        paginas.push('...');
        for (let i = totalPaginas - 3; i <= totalPaginas; i++) paginas.push(i);
      } else {
        paginas.push(1);
        paginas.push('...');
        paginas.push(paginaActual - 1);
        paginas.push(paginaActual);
        paginas.push(paginaActual + 1);
        paginas.push('...');
        paginas.push(totalPaginas);
      }
    }
    return paginas;
  };

  if (totalPaginas <= 1 && !showPageSizeSelector) return null; // Si solo hay una página y no hay selector, no mostrar nada

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
          Mostrando {indiceInicio + 1}-{Math.min(indiceFin, totalRegistros)} de{' '}
          {totalRegistros} registro(s)
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {showPageSizeSelector && onPageSizeChange && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label htmlFor="pageSizeSelect" style={{ fontSize: '12px', color: '#6b7a99' }}>
                Mostrar:
              </label>
              <select
                id="pageSizeSelect"
                value={pageSize}
                onChange={(e) => {
                  onPageSizeChange(Number(e.target.value));
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: '1px solid #d8dde8',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                }}
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '12px', color: '#6b7a99' }}>registros</span>
            </div>
          )}
          <span style={{ fontSize: '12px', color: '#6b7a99' }}>
            Página {paginaActual} de {totalPaginas}
          </span>
        </div>
      </div>

      {/* Botones de paginación (se muestran aunque totalPaginas sea 1 si hay selector) */}
      {totalPaginas > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
            paddingTop: '12px',
            borderTop: '1px solid #e2e8f0',
          }}
        >
          {/* Botones Anterior, siguiente, etc. (sin cambios) */}
          <button
            onClick={onPaginaAnterior}
            disabled={paginaActual === 1}
            style={{
              padding: '6px 12px',
              border: '1px solid #d8dde8',
              borderRadius: '6px',
              background: paginaActual === 1 ? '#f7f8fa' : '#fff',
              color: paginaActual === 1 ? '#b8c0d0' : '#1a2540',
              fontSize: '12px',
              fontWeight: 500,
              cursor: paginaActual === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            ◀ Anterior
          </button>

          {getPaginasVisibles().map((pagina, index) => (
            <React.Fragment key={index}>
              {pagina === '...' ? (
                <span style={{ padding: '6px 8px', color: '#6b7a99', fontSize: '12px' }}>
                  ...
                </span>
              ) : (
                <button
                  onClick={() => onIrAPagina(pagina as number)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid',
                    borderRadius: '6px',
                    background: paginaActual === pagina ? '#1a2540' : '#fff',
                    color: paginaActual === pagina ? '#fff' : '#1a2540',
                    borderColor: paginaActual === pagina ? '#1a2540' : '#d8dde8',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    minWidth: '36px',
                  }}
                >
                  {pagina}
                </button>
              )}
            </React.Fragment>
          ))}

          <button
            onClick={onPaginaSiguiente}
            disabled={paginaActual === totalPaginas}
            style={{
              padding: '6px 12px',
              border: '1px solid #d8dde8',
              borderRadius: '6px',
              background: paginaActual === totalPaginas ? '#f7f8fa' : '#fff',
              color: paginaActual === totalPaginas ? '#b8c0d0' : '#1a2540',
              fontSize: '12px',
              fontWeight: 500,
              cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
            }}
          >
            Siguiente ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default Paginacion;