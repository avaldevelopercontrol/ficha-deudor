import React, { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Table from '../../../../shared/components/table/Table';
import Paginacion from '../../../../shared/components/ui/Paginacion';
import { WrapCell } from '../../../../shared/components/ui/WrapCell';
import { usePagosByDeudor } from '../../hooks/popups/usePagosByDeudor';
import type { Column, Pago, DeudorInfo } from '../../../../shared/types';

const formatMonto = (monto: number, moneda: string): string => {
  const simbolo = moneda === 'SOLES' || moneda === 'PEN' ? 'S/' : moneda === 'DOLARES' || moneda === 'USD' ? '$' : '';
  return `${simbolo} ${monto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const PagoDeudorPopup: React.FC = () => {
  const { id_cliente, id_cartera, id_deudor } = useParams<{
    id_cliente: string;
    id_cartera: string;
    id_deudor: string;
  }>();

  const [searchParams] = useSearchParams();
  const nombre = decodeURIComponent(searchParams.get('nombre') || '');
  const documento = decodeURIComponent(searchParams.get('documento') || '');

  const deudorData: DeudorInfo | null = nombre
    ? {
        nombreRazonSocial: nombre,
        dniRuc: documento,
        gradoInstruccion: '',
        edad: '',
        contacto: '',
        asesorPostVenta: '',
        asesorComercial: '',
        correoApv: '',
        correoAc: '',
      }
    : null;

  const {
    allData,
    paginatedData,
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
  } = usePagosByDeudor(
    id_cliente ?? '',
    id_cartera ?? '',
    id_deudor ?? ''
  );

  const handleClose = () => {
    window.close();
  };

  const columns: Column[] = useMemo(
    () => [
      {
        key: 'nro',
        label: 'Nro',
        width: '60px',
        render: (row: Pago) => <span>{row.nro}</span>,
      },
      {
        key: 'codigoCliente',
        label: 'Codigo Cliente',
        width: '130px',
        render: (row: Pago) => <span>{row.codigoCliente}</span>,
      },
      {
        key: 'nroDocumento',
        label: 'Nro Documento',
        width: '160px',
        render: (row: Pago) => <WrapCell>{row.nroDocumento}</WrapCell>,
      },
      {
        key: 'fechaPago',
        label: 'Fecha Pago',
        width: '110px',
        render: (row: Pago) => <span>{row.fechaPago}</span>,
      },
      {
        key: 'montoPago',
        label: 'Monto Pago',
        width: '120px',
        render: (row: Pago) => (
          <span style={{ fontWeight: 600, color: '#2e7d32' }}>
            {formatMonto(row.montoPago, row.moneda)}
          </span>
        ),
      },
      {
        key: 'moneda',
        label: 'Moneda',
        width: '90px',
        render: (row: Pago) => <span>{row.moneda}</span>,
      },
      {
        key: 'zona',
        label: 'Zona',
        width: '100px',
        render: (row: Pago) => <span>{row.zona}</span>,
      },
      {
        key: 'notaCredito',
        label: 'NC',
        width: '100px',
        render: (row: Pago) => <span>{row.notaCredito}</span>,
      },
      {
        key: 'marca',
        label: 'Marca',
        width: '100px',
        render: (row: Pago) => <span>{row.marca}</span>,
      },
    ],
    []
  );

  const indiceInicio = (pageNumber - 1) * pageSize;
  const indiceFin = Math.min(pageNumber * pageSize, totalRecords);

  if (isLoading) {
    return (
      <div className="popup-loading">
        <div className="popup-loading-spinner" />
        <p>Cargando pagos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popup-error">
        <div className="popup-error-icon">⚠</div>
        <h4>Error al cargar pagos</h4>
        <p>{error}</p>
        <div className="popup-error-actions">
          <button className="btn btn-primary" onClick={refetch}>
            Reintentar
          </button>
          <button className="btn btn-secondary" onClick={handleClose}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ─── HEADER ─── */}
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-text">PAGOS</span>
          <span className="logo-sub">DEUDOR</span>
        </div>
        <nav className="app-nav">
          <span className="nav-item">GESTIÓN DE COBRANZAS</span>
          <span className="nav-sep">›</span>
          <span className="nav-item nav-item--active">PAGOS</span>
        </nav>
        <div className="app-user">
          {nombre && (
            <span className="user-name" title={documento || undefined}>
              {nombre}
              {documento && <span className="user-doc"> — {documento}</span>}
            </span>
          )}
        </div>
      </header>

      {/* ─── CONTENIDO ─── */}
      <main className="popup-main">
        {/* Toolbar */}
        <div className="popup-toolbar">
          <div className="toolbar-info">
            <span className="toolbar-count">
              Mostrando <strong>{indiceInicio + 1}-{indiceFin}</strong> de <strong>{totalRecords}</strong> pago(s)
            </span>
            <span className="toolbar-page">
              Página {pageNumber} de {totalPages}
            </span>
          </div>
        </div>

        {/* Tabla */}
        <div className="popup-table-wrapper">
          <Table
            columns={columns}
            data={paginatedData}
            emptyMessage="No se encontraron pagos"
            enableColumnFilters={true}
            allData={allData}
            textFilters={textFilters}
            selectedFilters={selectedFilters}
            onTextFilterChange={onTextFilterChange}
            onSelectedFilterChange={onSelectedFilterChange}
          />
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="popup-pagination">
            <Paginacion
              paginaActual={pageNumber}
              totalPaginas={totalPages}
              totalRegistros={totalRecords}
              indiceInicio={indiceInicio}
              indiceFin={indiceFin}
              onPaginaAnterior={() => setPageNumber(Math.max(1, pageNumber - 1))}
              onPaginaSiguiente={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
              onIrAPagina={setPageNumber}
              showPageSizeSelector={true}
              pageSize={pageSize}
              pageSizeOptions={[5, 10, 30, 50]}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </main>
    </>
  );
};

export default PagoDeudorPopup;