import React, { useState, useRef, useEffect, useMemo } from 'react';

import Table from '../../../../shared/components/table/Table';
import Modal from '../../../../shared/components/modals/Modal';
import Paginacion from '../../../../shared/components/ui/Paginacion';
import { useDocumentos, openPopup } from '../../hooks/useDocumentos';

import type {
  DocumentoApi,
  ColumnApi,
  BotonApi,
  DeudorInfo,
} from '../../../../shared/types/indexApi';

import { getDocumentoColumnValue } from '../../utils/documentosDynamicKeys';

interface Props {
  id_cliente: string;
  id_cartera: string;
  id_deudor: string;
  id_contrato: string;
  id_usuario: string;
  data: DeudorInfo;
  onDocumentoClick?: (doc: DocumentoApi) => void;
  onFilteredDocumentosChange?: (documentos: DocumentoApi[]) => void;
}

// ─── Anchos fijos por columna conocida ───
const COLUMN_WIDTHS: Record<string, string> = {
  dyn_0: '120px', // Tramo
  dyn_1: '80px', // Id
  dyn_2: '160px', // Documento
  dyn_3: '100px', // Estado
  dyn_4: '120px', // Vencimiento
  dyn_5: '75px', // Mon.
  dyn_6: '120px', // Importe
  dyn_7: '120px', // Deuda
};

// ─── Configuración para columnas dinámicas sin ancho fijo ───
const MIN_DYNAMIC_COLUMN_WIDTH = 90;
const CHAR_WIDTH_PX = 8;
const CELL_EXTRA_WIDTH_PX = 32;

const getTextLengthForWidth = (
  value: unknown,
  column: ColumnApi
): number => {
  if (value === null || value === undefined) return 1;

  if (column.type === 'money' && typeof value === 'number') {
    return value.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).length;
  }

  if (column.type === 'atraso') {
    return `${String(value)}d`.length;
  }

  return String(value).length;
};

const calculateDynamicColumnWidth = (
  column: ColumnApi,
  rows: DocumentoApi[]
): string => {
  const fixedWidth = COLUMN_WIDTHS[column.key];

  if (fixedWidth) {
    return fixedWidth;
  }

  const maxContentLength = rows.reduce((maxLength, row) => {
    const value = getDocumentoColumnValue(row, column);
    const valueLength = getTextLengthForWidth(value, column);
    return Math.max(maxLength, valueLength);
  }, column.label.length);

  const calculatedWidth = Math.max(
    MIN_DYNAMIC_COLUMN_WIDTH,
    maxContentLength * CHAR_WIDTH_PX + CELL_EXTRA_WIDTH_PX
  );

  return `${Math.ceil(calculatedWidth)}px`;
};

const DocumentosTable: React.FC<Props> = ({
  id_cliente,
  id_cartera,
  id_deudor,
  id_contrato,
  id_usuario,
  data,
  onDocumentoClick,
  onFilteredDocumentosChange,
}) => {
  const {
    columns,
    allData,
    filteredData,
    paginatedData,
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
    textFilters,
    selectedFilters,
    onTextFilterChange,
    onSelectedFilterChange,
  } = useDocumentos(id_cliente, id_cartera, id_deudor, id_contrato, id_usuario);

  useEffect(() => {
    onFilteredDocumentosChange?.(filteredData);
  }, [filteredData, onFilteredDocumentosChange]);

  const columnWidths = useMemo(() => {
    const rowsForWidth = allData.length > 0 ? allData : paginatedData;

    return columns.reduce<Record<string, string>>((acc, column) => {
      acc[column.key] = calculateDynamicColumnWidth(column, rowsForWidth);
      return acc;
    }, {});
  }, [columns, allData, paginatedData]);

  const handleBotonClick = (boton: BotonApi) => {
    if (boton.popupUrl) {
      const nombre = encodeURIComponent(data.nombreRazonSocial);
      const documento = encodeURIComponent(data.dniRuc);
      const url = `${boton.popupUrl}?nombre=${nombre}&documento=${documento}`;

      openPopup(url, boton.label, 1500, 600);
    } else {
      openModal(boton.label);
    }
  };

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

    el.scrollBy({
      left: direccion === 'izq' ? -200 : 200,
      behavior: 'smooth',
    });
  };

  const openModal = (title: string) => {
    setModalTitle(title);
    setModalOpen(true);
  };

  const renderCell = (row: DocumentoApi, column: ColumnApi) => {
    const value = getDocumentoColumnValue(row, column);

    if (value === null || value === undefined) return '-';

    switch (column.type) {
      case 'money':
        return typeof value === 'number'
          ? value.toLocaleString('es-PE', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
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
        <p style={{ fontSize: '0.9em', color: '#666', marginBottom: 16 }}>
          {error}
        </p>
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

      <div className="documentos-table-compact">
        <style>{`
          .documentos-table-compact table {
            table-layout: auto !important;
            width: max-content !important;
            min-width: 100% !important;
          }

          .documentos-table-compact th,
          .documentos-table-compact td {
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            padding: 6px 4px !important;
            font-size: 1em !important;
          }

          .documentos-table-compact th input[type="text"],
          .documentos-table-compact th input[type="search"],
          .documentos-table-compact th select {
            width: 100% !important;
            min-width: 0 !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            font-size: 1.5em !important;
            padding: 3px 4px !important;
            height: 26px !important;
          }

          .documentos-table-compact th input::placeholder {
            font-size: 0.85em !important;
          }

          .documentos-table-compact th > div:first-child {
            font-size: 0.8em !important;
            font-weight: 600 !important;
            margin-bottom: 2px !important;
          }

          ${columns.map((col, index) => {
            const width = columnWidths[col.key] || `${MIN_DYNAMIC_COLUMN_WIDTH}px`;
            const isFixedColumn = Boolean(COLUMN_WIDTHS[col.key]);

            return `
              .documentos-table-compact th:nth-child(${index + 1}),
              .documentos-table-compact td:nth-child(${index + 1}) {
                width: ${width} !important;
                min-width: ${width} !important;
                ${isFixedColumn ? `max-width: ${width} !important;` : ''}
              }
            `;
          }).join('\n')}
        `}</style>

        <Table
          columns={columns.map((col) => ({
            key: col.key,
            label: col.label,
            render: (row: DocumentoApi) => renderCell(row, col),
          }))}
          data={paginatedData}
          onRowClick={onDocumentoClick}
          emptyMessage="No se encontraron documentos para este deudor."
          fitToPanel={false}
          enableColumnFilters={true}
          allData={allData}
          textFilters={textFilters}
          selectedFilters={selectedFilters}
          onTextFilterChange={onTextFilterChange}
          onSelectedFilterChange={onSelectedFilterChange}
        />
      </div>

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

      <div
        className="ficha-block botones-carrusel-wrapper"
        style={{ marginTop: 12, paddingBottom: 12 }}
      >
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
                onClick={() => handleBotonClick(boton)}
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

      <Modal
        isOpen={modalOpen}
        title={modalTitle}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default DocumentosTable;