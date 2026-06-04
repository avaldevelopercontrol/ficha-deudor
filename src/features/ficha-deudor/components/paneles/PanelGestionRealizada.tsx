// src/components/paneles/PanelGestionRealizada.tsx
import React, { useMemo } from 'react';
import Table from '../../../../shared/components/table/Table';
import { ActionButton } from '../../../../shared/components/ui';
import Paginacion from '../../../../shared/components/ui/Paginacion';
import { WrapCell } from '../../../../shared/components/ui/WrapCell';
import { PanelLayout } from './PanelLayout';
import { useDualViewTable } from '../../../../shared/hooks/ui/useDualViewTable';
import { useGestionesRealizadas } from '../../hooks/useGestionesRealizadas';
import type { Column, GestionRealizada, GestionCompleta } from '../../../../shared/types';

interface Props {
  isActive: boolean;
  id_deudor: string;
  id_cartera: string;
}

const PanelGestionRealizada: React.FC<Props> = ({ isActive, id_deudor, id_cartera }) => {
  const { resumido: dataResumido, completo: dataExpandido, isLoading, error, setResumido } = useGestionesRealizadas(id_deudor, id_cartera);

  const {
    vistaExpandida,
    handleVerMas,
    handleVolver,
    resumido,
    expandido,
  } = useDualViewTable<GestionRealizada, GestionCompleta>({
    dataResumido,
    dataExpandido,
    resetDeps: [isActive, id_deudor, id_cartera],
  });

  const handleEliminar = (row: GestionRealizada) => {
    if (window.confirm(`¿Eliminar gestión N° ${row.nro}?`)) {
      setResumido(prev => prev.filter(g => g.id !== row.id));
    }
  };

  const columnsResumidas: Column[] = useMemo(() => [
    { key: 'nro', label: 'Nro', render: (row: GestionRealizada) => <span style={{ fontWeight: 700, color: '#1a2540' }}>{row.nro}</span> },
    { key: 'fecha', label: 'Fecha' },
    { key: 'gestor', label: 'Gestor', render: (row: GestionRealizada) => <WrapCell>{row.gestor}</WrapCell> },
    { key: 'documento', label: 'Documento' },
    { key: 'operacion', label: 'Operación', render: (row: GestionRealizada) => <span className="badge badge-info" style={{ fontSize: '10px', textTransform: 'uppercase' }}>{row.operacion}</span> },
    { key: 'respuesta', label: 'Respuesta', render: (row: GestionRealizada) => <WrapCell color={row.respuesta.includes('Contactado') ? '#166534' : '#991b1b'} weight={500}>{row.respuesta}</WrapCell> },
    { key: 'comentario', label: 'Comentario', render: (row: GestionRealizada) => <WrapCell>{row.comentario}</WrapCell> },
    { 
      key: 'acciones', 
      label: 'Borrar', 
      width: '55px',
      filterable: false, 
      render: (row: GestionRealizada) => (
        <ActionButton label="" variant="danger" size="sm" icon="🗑" onClick={() => handleEliminar(row)} />
      ), 
    },
  ], []);

  const columnsExpandidas: Column[] = useMemo(() => [
    { key: 'nro', label: 'Nro', render: (row: GestionCompleta) => <span style={{ fontWeight: 700, color: '#1a2540' }}>{row.nro}</span> },
    { key: 'cliente', label: 'Cliente', render: (row: GestionCompleta) => <WrapCell>{row.cliente}</WrapCell> },
    { key: 'cartera', label: 'Cartera', render: (row: GestionCompleta) => <WrapCell>{row.cartera}</WrapCell> },
    { key: 'campana', label: 'Campaña' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'gestor', label: 'Gestor', render: (row: GestionCompleta) => <WrapCell>{row.gestor}</WrapCell> },
    { key: 'documento', label: 'Documento' },
    { key: 'operacion', label: 'Operación', render: (row: GestionCompleta) => <span className="badge badge-info" style={{ fontSize: '10px', textTransform: 'uppercase' }}>{row.operacion}</span> },
    { key: 'resultado', label: 'Resultado', render: (row: GestionCompleta) => <WrapCell color={row.resultado.includes('Contactado') ? '#166534' : '#991b1b'} weight={500}>{row.resultado}</WrapCell> },
    { key: 'comentario', label: 'Comentario', render: (row: GestionCompleta) => <WrapCell>{row.comentario}</WrapCell> },
  ], []);

  // ─── ESTADOS DE CARGA/ERROR ───
  if (!isActive) return null;

  if (isLoading) {
    return (
      <PanelLayout title="GESTIONES REALIZADAS" isActive={isActive}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <span>Cargando gestiones...</span>
        </div>
      </PanelLayout>
    );
  }

  if (error) {
    return (
      <PanelLayout title="GESTIONES REALIZADAS" isActive={isActive}>
        <div style={{ padding: '2rem', color: '#c00' }}>
          <p>Error al cargar: {error}</p>
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
        // ─── VISTA RESUMIDA ───
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              {resumido.datosFiltrados.length} gestión(es) filtrada(s)
            </span>
          </div>

          <Table
            columns={columnsResumidas}
            data={resumido.datosPaginados}
            emptyMessage="No se encontraron gestiones realizadas"
            enableColumnFilters={true}
            allData={dataResumido}
            textFilters={resumido.textFilters}
            selectedFilters={resumido.selectedFilters}
            onTextFilterChange={resumido.onTextFilterChange}
            onSelectedFilterChange={resumido.onSelectedFilterChange}
          />

          <Paginacion
            paginaActual={resumido.paginaActual}
            totalPaginas={resumido.totalPaginas}
            totalRegistros={resumido.datosFiltrados.length}
            indiceInicio={resumido.indiceInicio}
            indiceFin={resumido.indiceFin}
            onPaginaAnterior={() => resumido.setPaginaActual(p => Math.max(1, p - 1))}
            onPaginaSiguiente={() => resumido.setPaginaActual(p => Math.min(resumido.totalPaginas, p + 1))}
            onIrAPagina={resumido.setPaginaActual}
            showPageSizeSelector={true}
            pageSize={resumido.pageSize}
            pageSizeOptions={[5, 10, 30, 50]}
            onPageSizeChange={resumido.setPageSize}
          />

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <ActionButton label="Ver más gestiones" variant="info" size="md" icon="▼" onClick={handleVerMas} />
          </div>
        </div>
      ) : (
        // ─── VISTA EXPANDIDA ───
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                {expandido.datosFiltrados.length} gestión(es) en total (filtradas)
              </span>
              <ActionButton label="Volver" variant="secondary" size="sm" icon="◀" onClick={handleVolver} />
            </div>

            <Table
              columns={columnsExpandidas}
              data={expandido.datosPaginados}
              emptyMessage="No se encontraron gestiones"
              enableColumnFilters={true}
              allData={dataExpandido}
              textFilters={expandido.textFilters}
              selectedFilters={expandido.selectedFilters}
              onTextFilterChange={expandido.onTextFilterChange}
              onSelectedFilterChange={expandido.onSelectedFilterChange}
            />

            <Paginacion
              paginaActual={expandido.paginaActual}
              totalPaginas={expandido.totalPaginas}
              totalRegistros={expandido.datosFiltrados.length}
              indiceInicio={expandido.indiceInicio}
              indiceFin={expandido.indiceFin}
              onPaginaAnterior={() => expandido.setPaginaActual(p => Math.max(1, p - 1))}
              onPaginaSiguiente={() => expandido.setPaginaActual(p => Math.min(expandido.totalPaginas, p + 1))}
              onIrAPagina={expandido.setPaginaActual}
              showPageSizeSelector={true}
              pageSize={expandido.pageSize}
              pageSizeOptions={[5, 10, 30, 50]}
              onPageSizeChange={expandido.setPageSize}
            />
          </div>
        </div>
      )}
    </PanelLayout>
  );
};

export default PanelGestionRealizada;