import React, { useMemo, useState } from 'react';
import Table from '../../../../shared/components/table/Table';
import { ActionButton } from '../../../../shared/components/ui';
import Paginacion from '../../../../shared/components/ui/Paginacion';
import { WrapCell } from '../../../../shared/components/ui/WrapCell';
import { PanelLayout } from './PanelLayout';
import { useGestionesRealizadas } from '../../hooks/useGestionesRealizadas';
import type { Column, GestionRealizada, GestionCompleta } from '../../../../shared/types';
import ExpandableCell from '../../../../shared/components/ui/ExpandableCell';

interface Props {
  isActive: boolean;
  id_cliente: string;
  id_cartera: string;
  id_deudor: string;
  id_usuario: string;
}

const PanelGestionRealizada: React.FC<Props> = ({ isActive, id_cliente, id_cartera, id_deudor, id_usuario }) => {
  const {
    // Resumido
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
    setResumido,

    // Expandido / Completo
    completo,
    completoLoading,
    completoError,
    completoPageNumber,
    completoPageSize,
    completoTotalRecords,
    completoTotalPages,
    setCompletoPageNumber,
    setCompletoPageSize,
    refetchCompleto,
  } = useGestionesRealizadas(id_cliente, id_cartera, id_deudor, id_usuario);

  // Estado local para toggle entre vistas
  const [vistaExpandida, setVistaExpandida] = useState(false);

  const handleVerMas = () => setVistaExpandida(true);
  const handleVolver = () => setVistaExpandida(false);

  const handleEliminar = (row: GestionRealizada) => {
    if (window.confirm(`¿Eliminar gestión N° ${row.nro}?`)) {
      setResumido((prev) => prev.filter((g) => g.id !== row.id));
    }
  };

  // ─── Columnas estáticas vista RESUMIDA ───
  const columnsResumidas: Column[] = useMemo(
    () => [
      {
        key: 'nro',
        label: 'Nro',
        render: (row: GestionRealizada) => (
          <span style={{ fontWeight: 700, color: '#1a2540' }}>{row.nro}</span>
        ),
      },
      { key: 'fecha', label: 'Fecha' },
      {
        key: 'gestor',
        label: 'Gestor',
        render: (row: GestionRealizada) => <WrapCell>{row.gestor}</WrapCell>,
      },
      { key: 'documento', label: 'Documento' },
      {
        key: 'operacion',
        label: 'Operación',
        render: (row: GestionRealizada) => (
          <span className="badge badge-info" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
            {row.operacion}
          </span>
        ),
      },
      {
        key: 'respuesta',
        label: 'Respuesta',
        render: (row: GestionRealizada) => (
          <WrapCell color={row.respuesta.includes('Contactado') ? '#166534' : '#991b1b'} weight={500}>
            {row.respuesta}
          </WrapCell>
        ),
      },
      {
        key: 'comentario',
        label: 'Comentario',
        render: (row: GestionRealizada) => (
        <ExpandableCell text={row.comentario} maxLines={2} lineHeight={18} />
        ),
      },
      {
        key: 'acciones',
        label: 'Borrar',
        width: '55px',
        filterable: false,
        render: (row: GestionRealizada) => (
          <ActionButton
            label=""
            variant="danger"
            size="sm"
            icon="🗑"
            onClick={() => handleEliminar(row)}
          />
        ),
      },
    ],
    []
  );

  // ─── Columnas estáticas vista EXPANDIDA ───
  const columnsExpandidas: Column[] = useMemo(
    () => [
      {
        key: 'nro',
        label: 'Nro',
        render: (row: GestionCompleta) => (
          <span style={{ fontWeight: 700, color: '#1a2540' }}>{row.nro}</span>
        ),
      },
      {
        key: 'cliente',
        label: 'Cliente',
        render: (row: GestionCompleta) => <WrapCell>{row.cliente}</WrapCell>,
      },
      {
        key: 'cartera',
        label: 'Cartera',
        render: (row: GestionCompleta) => <WrapCell>{row.cartera}</WrapCell>,
      },
      {
        key: 'campana',
        label: 'Campaña',
        render: (row: GestionCompleta) => <WrapCell>{row.campana}</WrapCell>,
      },
      { key: 'fecha', label: 'Fecha' },
      {
        key: 'gestor',
        label: 'Gestor',
        render: (row: GestionCompleta) => <WrapCell>{row.gestor}</WrapCell>,
      },
      { key: 'documento', label: 'Documento' },
      {
        key: 'operacion',
        label: 'Operación',
        render: (row: GestionCompleta) => (
          <span className="badge badge-info" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
            {row.operacion}
          </span>
        ),
      },
      {
        key: 'resultado',
        label: 'Resultado',
        render: (row: GestionCompleta) => (
          <WrapCell color={row.resultado.includes('Contactado') ? '#166534' : '#991b1b'} weight={500}>
            {row.resultado}
          </WrapCell>
        ),
      },
      {
        key: 'comentario',
        label: 'Comentario',
        render: (row: GestionCompleta) => (
        <ExpandableCell text={row.comentario} maxLines={2} lineHeight={18} />
        ),
      },
    ],
    []
  );

  const indiceInicio = (pageNumber - 1) * pageSize;
  const indiceFin = Math.min(pageNumber * pageSize, totalRecords);

  const completoIndiceInicio = (completoPageNumber - 1) * completoPageSize;
  const completoIndiceFin = Math.min(completoPageNumber * completoPageSize, completoTotalRecords);

  // ─── ESTADOS DE CARGA/ERROR ───
  if (!isActive) return null;

  if (!vistaExpandida && isLoading) {
    return (
      <PanelLayout title="GESTIONES REALIZADAS" isActive={isActive}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <span>Cargando gestiones...</span>
        </div>
      </PanelLayout>
    );
  }

  if (!vistaExpandida && error) {
    return (
      <PanelLayout title="GESTIONES REALIZADAS" isActive={isActive}>
        <div style={{ padding: '2rem', color: '#c00' }}>
          <p style={{ marginBottom: 12 }}>Error al cargar gestiones:</p>
          <p style={{ fontSize: '0.9em', color: '#666', marginBottom: 16 }}>{error}</p>
          <button onClick={refetch} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Reintentar
          </button>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout
      title={vistaExpandida ? 'TODAS LAS GESTIONES' : 'GESTIONES REALIZADAS'}
      isActive={isActive}
    >
      {!vistaExpandida ? (
        // ═══════════════════════════════════════
        // VISTA RESUMIDA
        // ═══════════════════════════════════════
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              Mostrando {indiceInicio + 1}-{indiceFin} de {totalRecords} gestión(es)
            </span>
          </div>

          <Table
            columns={columnsResumidas}
            data={paginatedData}
            emptyMessage="No se encontraron gestiones realizadas"
            enableColumnFilters={true}
            allData={allData}
            textFilters={textFilters}
            selectedFilters={selectedFilters}
            onTextFilterChange={onTextFilterChange}
            onSelectedFilterChange={onSelectedFilterChange}
            fitToPanel={false}
          />

          {totalPages > 0 && (
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
          )}

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <ActionButton
              label="Ver más gestiones"
              variant="info"
              size="md"
              icon="▼"
              onClick={handleVerMas}
            />
          </div>
        </div>
      ) : (
        // ═══════════════════════════════════════
        // VISTA EXPANDIDA
        // ═══════════════════════════════════════
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              Mostrando {completoIndiceInicio + 1}-{completoIndiceFin} de {completoTotalRecords} gestión(es)
            </span>
            <ActionButton
              label="Volver"
              variant="secondary"
              size="sm"
              icon="◀"
              onClick={handleVolver}
            />
          </div>

          {completoLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <span>Cargando gestiones históricas...</span>
            </div>
          ) : completoError ? (
            <div style={{ padding: '2rem', color: '#c00' }}>
              <p style={{ marginBottom: 12 }}>Error al cargar gestiones históricas:</p>
              <p style={{ fontSize: '0.9em', color: '#666', marginBottom: 16 }}>{completoError}</p>
              <button onClick={refetchCompleto} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                Reintentar
              </button>
            </div>
          ) : (
            <>
              <Table
                columns={columnsExpandidas}
                data={completo}
                emptyMessage="No se encontraron gestiones históricas"
                enableColumnFilters={false}
                fitToPanel={false}
              />

              {completoTotalPages > 1 && (
                <Paginacion
                  paginaActual={completoPageNumber}
                  totalPaginas={completoTotalPages}
                  totalRegistros={completoTotalRecords}
                  indiceInicio={completoIndiceInicio}
                  indiceFin={completoIndiceFin}
                  onPaginaAnterior={() => setCompletoPageNumber(Math.max(1, completoPageNumber - 1))}
                  onPaginaSiguiente={() => setCompletoPageNumber(Math.min(completoTotalPages, completoPageNumber + 1))}
                  onIrAPagina={setCompletoPageNumber}
                  showPageSizeSelector={true}
                  pageSize={completoPageSize}
                  pageSizeOptions={[10, 25, 50, 100]}
                  onPageSizeChange={setCompletoPageSize}
                />
              )}
            </>
          )}
        </div>
      )}
    </PanelLayout>
  );
};

export default PanelGestionRealizada;