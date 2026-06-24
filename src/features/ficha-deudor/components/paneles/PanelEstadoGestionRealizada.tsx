import React, { useMemo, useState } from 'react';
import Table from '../../../../shared/components/table/Table';
import { ActionButton } from '../../../../shared/components/ui';
import Paginacion from '../../../../shared/components/ui/Paginacion';
import { WrapCell } from '../../../../shared/components/ui/WrapCell';
import { PanelLayout } from './PanelLayout';
import { useEstadosGestion } from '../../hooks/useEstadosGestion';
import type { Column, EstadoGestion, EstadoGestionCompleta } from '../../../../shared/types';
import ExpandableCell from '../../../../shared/components/ui/ExpandableCell';

interface Props {
  isActive: boolean;
  id_cliente: string;
  id_cartera: string;
  id_deudor: string;
}

const PanelEstadoGestionRealizada: React.FC<Props> = ({ isActive, id_cliente, id_cartera, id_deudor }) => {
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
  } = useEstadosGestion(id_cliente, id_cartera, id_deudor);

  // Estado local para toggle entre vistas
  const [vistaExpandida, setVistaExpandida] = useState(false);

  const handleVerMas = () => setVistaExpandida(true);
  const handleVolver = () => setVistaExpandida(false);

  // ─── Columnas estáticas vista RESUMIDA ───
  const columnsResumidas: Column[] = useMemo(
    () => [
      {
        key: 'nro',
        label: 'Nro',
        render: (row: EstadoGestion) => (
          <span style={{ fontWeight: 700, color: '#1a2540' }}>{row.nro}</span>
        ),
      },
      { key: 'fecha', label: 'Fecha' },
      {
        key: 'operador',
        label: 'Operador',
        render: (row: EstadoGestion) => <WrapCell>{row.operador}</WrapCell>,
      },
      { key: 'documento', label: 'Documento' },
      {
        key: 'operacion',
        label: 'Operación',
        render: (row: EstadoGestion) => (
          <span className="badge badge-info" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
            {row.operacion}
          </span>
        ),
      },
      {
        key: 'resultado',
        label: 'Resultado',
        render: (row: EstadoGestion) => (
          <WrapCell color={row.resultado.includes('Contactado') ? '#166534' : '#991b1b'} weight={500}>
            {row.resultado}
          </WrapCell>
        ),
      },
      {
        key: 'comentario',
        label: 'Comentario',
        render: (row: EstadoGestion) => (
        <ExpandableCell text={row.comentario} maxLines={2} lineHeight={18} />
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
        render: (row: EstadoGestionCompleta) => (
          <span style={{ fontWeight: 700, color: '#1a2540' }}>{row.nro}</span>
        ),
      },
      {
        key: 'cliente',
        label: 'Cliente',
        render: (row: EstadoGestionCompleta) => <WrapCell>{row.cliente}</WrapCell>,
      },
      {
        key: 'cartera',
        label: 'Cartera',
        render: (row: EstadoGestionCompleta) => <WrapCell>{row.cartera}</WrapCell>,
      },
      { key: 'campana', label: 'Campaña' },
      { key: 'fecha', label: 'Fecha' },
      {
        key: 'gestor',
        label: 'Gestor',
        render: (row: EstadoGestionCompleta) => <WrapCell>{row.gestor}</WrapCell>,
      },
      { key: 'documento', label: 'Documento' },
      {
        key: 'operacion',
        label: 'Operación',
        render: (row: EstadoGestionCompleta) => (
          <span className="badge badge-info" style={{ fontSize: '10px', textTransform: 'uppercase' }}>
            {row.operacion}
          </span>
        ),
      },
      {
        key: 'resultado',
        label: 'Resultado',
        render: (row: EstadoGestionCompleta) => (
          <WrapCell color={row.resultado.includes('Contactado') ? '#166534' : '#991b1b'} weight={500}>
            {row.resultado}
          </WrapCell>
        ),
      },
      {
        key: 'comentario',
        label: 'Comentario',
        render: (row: EstadoGestionCompleta) => (
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
      <PanelLayout title="ESTADO DE GESTIÓN REALIZADA" isActive={isActive}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <span>Cargando estados de gestión...</span>
        </div>
      </PanelLayout>
    );
  }

  if (!vistaExpandida && error) {
    return (
      <PanelLayout title="ESTADO DE GESTIÓN REALIZADA" isActive={isActive}>
        <div style={{ padding: '2rem', color: '#c00' }}>
          <p style={{ marginBottom: 12 }}>Error al cargar estados de gestión:</p>
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
      title={vistaExpandida ? 'TODOS LOS ESTADOS DE GESTIÓN' : 'ESTADO DE GESTIÓN REALIZADA'}
      isActive={isActive}
    >
      {!vistaExpandida ? (
        // ═══════════════════════════════════════
        // VISTA RESUMIDA
        // ═══════════════════════════════════════
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              Mostrando {indiceInicio + 1}-{indiceFin} de {totalRecords} estado(s) de gestión
            </span>
          </div>

          <Table
            columns={columnsResumidas}
            data={paginatedData}
            emptyMessage="No se encontraron estados de gestión"
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
              label="Ver más estados de gestiones"
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
              Mostrando {completoIndiceInicio + 1}-{completoIndiceFin} de {completoTotalRecords} estado(s) de gestión
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
              <span>Cargando estados de gestión históricos...</span>
            </div>
          ) : completoError ? (
            <div style={{ padding: '2rem', color: '#c00' }}>
              <p style={{ marginBottom: 12 }}>Error al cargar estados de gestión históricos:</p>
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
                emptyMessage="No se encontraron estados de gestión históricos"
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

export default PanelEstadoGestionRealizada;