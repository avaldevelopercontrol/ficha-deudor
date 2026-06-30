import React, { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Table from '../../../../shared/components/table/Table';
import Paginacion from '../../../../shared/components/ui/Paginacion';
import { WrapCell } from '../../../../shared/components/ui/WrapCell';
import { useAgendasByDeudor } from '../../hooks/popups/useAgendasByDeudor';
import type { Column, Agenda, DeudorInfo } from '../../../../shared/types';

const formatFecha = (fechaIso: string): string => {
  if (!fechaIso) return '—';
  const d = new Date(fechaIso);
  if (isNaN(d.getTime())) return fechaIso;
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AgendaDeudorPopup: React.FC = () => {
  const { id_cliente, id_cartera, id_deudor, id_usuario } = useParams<{
    id_cliente: string;
    id_cartera: string;
    id_deudor: string;
    id_usuario: string;
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
  } = useAgendasByDeudor(
    id_cliente ?? '',
    id_cartera ?? '',
    id_deudor ?? '',
    id_usuario ?? ''
  );

  const handleClose = () => {
    window.close();
  };

  const columns: Column[] = useMemo(
    () => [
      {
        key: 'id',
        label: 'Id',
        width: '80px',
        render: (row: Agenda) => <span>{row.id}</span>,
      },
      {
        key: 'fechaNuevaGestion',
        label: 'Fech. Nueva Gestión',
        width: '160px',
        render: (row: Agenda) => <span>{formatFecha(row.fechaNuevaGestion)}</span>,
      },
      {
        key: 'tiempoVencido',
        label: 'Tiempo Vencido',
        width: '120px',
        render: (row: Agenda) => <span>{row.tiempoVencido}</span>,
      },
      {
        key: 'cartera',
        label: 'Cartera',
        render: (row: Agenda) => <WrapCell>{row.cartera}</WrapCell>,
      },
      {
        key: 'deudor',
        label: 'Deudor',
        render: (row: Agenda) => <WrapCell>{row.deudor}</WrapCell>,
      },
      {
        key: 'respuestaOEstado',
        label: 'Respuesta o Estado',
        width: '180px',
        render: (row: Agenda) => <WrapCell>{row.respuestaOEstado}</WrapCell>,
      },
      {
        key: 'usuario',
        label: 'Usuario',
        width: '100px',
        render: (row: Agenda) => <span>{row.usuario}</span>,
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
        <p>Cargando agendas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popup-error">
        <div className="popup-error-icon">⚠</div>
        <h4>Error al cargar agendas</h4>
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
          <span className="logo-text">AGENDAS</span>
          <span className="logo-sub">DEUDOR</span>
        </div>
        <nav className="app-nav">
          <span className="nav-item">GESTIÓN DE COBRANZAS</span>
          <span className="nav-sep">›</span>
          <span className="nav-item nav-item--active">AGENDAS REALIZADAS</span>
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
        {/* Toolbar (sin botón de agregar) */}
        <div className="popup-toolbar">
          <div className="toolbar-info">
            <span className="toolbar-count">
              Mostrando <strong>{indiceInicio + 1}-{indiceFin}</strong> de <strong>{totalRecords}</strong> agenda(s)
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
            emptyMessage="No se encontraron agendas"
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

export default AgendaDeudorPopup;