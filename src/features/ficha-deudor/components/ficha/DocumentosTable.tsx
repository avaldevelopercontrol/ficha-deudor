import React, { useState, useRef, useEffect } from 'react';
import Table from '../../../../shared/components/table/Table';
import Modal from '../../../../shared/components/modals/Modal';
import Paginacion from '../../../../shared/components/ui/Paginacion';
import { useDocumentos } from '../../hooks/useDocumentos';
import type { DocumentoApi, ColumnApi } from '../../../../shared/types/indexApi';

interface Props {
  id_cliente: string;
  id_cartera: string;
  id_deudor: string;
  id_contrato: string;
  onDocumentoClick?: (doc: DocumentoApi) => void;
}

const DocumentosTable: React.FC<Props> = ({
  id_cliente,
  id_cartera,
  id_deudor,
  id_contrato,
  onDocumentoClick,
}) => {
  const {
    columns,
    data,
    botones,
    isLoading,
    error,
    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
    setPageNumber,
    setPageSize,
    refetch,
  } = useDocumentos(id_cliente, id_cartera, id_deudor, id_contrato);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const [puedeScrollIzq, setPuedeScrollIzq] = useState(false);
  const [puedeScrollDer, setPuedeScrollDer] = useState(false);

  const verificarScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setPuedeScrollIzq(el.scrollLeft > 0);
    setPuedeScrollDer(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  useEffect(() => {
    verificarScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', verificarScroll);
    window.addEventListener('resize', verificarScroll);
    return () => {
      el.removeEventListener('scroll', verificarScroll);
      window.removeEventListener('resize', verificarScroll);
    };
  }, [botones]);

  const scroll = (direccion: 'izq' | 'der') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direccion === 'izq' ? -200 : 200, behavior: 'smooth' });
  };

  const openModal = (title: string) => {
    setModalTitle(title);
    setModalOpen(true);
  };

  const renderCell = (row: DocumentoApi, column: ColumnApi) => {
    const allKeys = Object.keys(row);
    const staticKeys = [
      'nId_DocxCobrar', 'mejorStatus', 'nId_Moneda', 'bEstado',
      'nZona', 'bSelected', 'nId_Estrategia', 'nId_Cartera',
    ];
    const dynamicKeys = allKeys.filter((k) => !staticKeys.includes(k));

    // Extraer el indice de dyn_N
    const match = column.key.match(/dyn_(\d+)/);
    if (!match) {
      // Fallback: buscar por nombre exacto
      const value = row[column.key];
      return value === null || value === undefined ? '-' : String(value);
    }

    const index = parseInt(match[1], 10);
    const fieldName = dynamicKeys[index];

    if (!fieldName) return '-';

    const value = row[fieldName];

    if (value === null || value === undefined) return '-';

    switch (column.type) {
      case 'money':
        return typeof value === 'number'
          ? value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : String(value);

      case 'atraso':
        return (
          <span style={{ color: 'red', fontWeight: 'bold' }}>
            {String(value)}d
          </span>
        );

      case 'estado': {
        const isActivo = String(value).toUpperCase() === 'ACTIVO';
        return (
          <span
            style={{
              color: isActivo ? '#2e7d32' : '#c62828',
              fontWeight: 600,
              backgroundColor: isActivo ? '#e8f5e9' : '#ffebee',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.85em',
            }}
          >
            {String(value)}
          </span>
        );
      }

      case 'date':
        return String(value);

      default:
        return String(value);
    }
  };

  if (isLoading) {
    return (
      <div className="ficha-card" style={{ padding: '2rem', textAlign: 'center' }}>
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
  }

  if (error) {
    return (
      <div className="ficha-card" style={{ padding: '2rem', color: '#c00' }}>
        <p style={{ marginBottom: 12 }}>Error al cargar documentos:</p>
        <p style={{ fontSize: '0.9em', color: '#666', marginBottom: 16 }}>{error}</p>
        <button
          onClick={refetch}
          style={{ padding: '8px 16px', cursor: 'pointer' }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="ficha-card">
      <div className="documentos-header">
        <span className="section-title">DOCUMENTOS A GESTIONAR</span>
        <span style={{ fontSize: '0.85em', color: '#666', marginLeft: 12 }}>
          ({totalRecords} registros)
        </span>
      </div>

      <Table
        columns={columns.map((col) => ({
          key: col.key,
          label: col.label,
          render: (row: DocumentoApi) => renderCell(row, col),
        }))}
        data={data}
        onRowClick={onDocumentoClick}
        emptyMessage="No se encontraron documentos para este deudor."
        fitToPanel={false}
      />

      {totalPages > 0 && (
        <Paginacion
          paginaActual={pageNumber}
          totalPaginas={totalPages}
          totalRegistros={totalRecords}
          indiceInicio={(pageNumber - 1) * pageSize}
          indiceFin={Math.min(pageNumber * pageSize, totalRecords)}
          onPaginaAnterior={() => setPageNumber(Math.max(1, pageNumber - 1))}
          onPaginaSiguiente={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
          onIrAPagina={setPageNumber}
          showPageSizeSelector={true}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 20, 50]}
          onPageSizeChange={setPageSize}
        />
      )}

      <div className="ficha-block botones-carrusel-wrapper" style={{ marginTop: 12, paddingBottom: 12,}}>
        {puedeScrollIzq && (
          <button
            type="button"
            className="carrusel-flecha carrusel-flecha-izq"
            onClick={() => scroll('izq')}
            aria-label="Ver botones anteriores"
          >
            &#8249;
          </button>
        )}

        <div className="botones-scroll-container" ref={scrollRef}>
          <div className="botones-estaticos">
            {botones.map((boton) => (
              <button
                key={boton.id}
                className="btn-est"
                type="button"
                onClick={() => openModal(boton.label)}
              >
                + {boton.label}
              </button>
            ))}
          </div>
        </div>

        {puedeScrollDer && (
          <button
            type="button"
            className="carrusel-flecha carrusel-flecha-der"
            onClick={() => scroll('der')}
            aria-label="Ver mas botones"
          >
            &#8250;
          </button>
        )}
      </div>

      <Modal isOpen={modalOpen} title={modalTitle} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export default DocumentosTable;