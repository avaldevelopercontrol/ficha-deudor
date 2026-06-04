import React, { useMemo } from 'react';
import Table from '../table/Table';
import { ActionButton } from '../ui';
import Paginacion from '../ui/Paginacion';
import { WrapCell } from '../ui/WrapCell';
import { PanelLayout } from './PanelLayout';
import { useDualViewTable } from '../../shared/hooks/ui/useDualViewTable';
import { useEstadosGestion } from '../../features/ficha-deudor/hooks/useEstadosGestion';
import type { Column, EstadoGestion, EstadoGestionCompleta } from '../../shared/types';

interface Props {
  isActive: boolean;
  id_deudor: string;
  id_cartera: string;
}

const PanelEstadoGestionRealizada: React.FC<Props> = ({ isActive, id_deudor, id_cartera }) => {
  const { resumido: dataResumido, completo: dataExpandido, isLoading, error } = useEstadosGestion(id_deudor, id_cartera);

  const {
    vistaExpandida,
    handleVerMas,
    handleVolver,
    resumido,
    expandido,
  } = useDualViewTable<EstadoGestion, EstadoGestionCompleta>({
    dataResumido,
    dataExpandido,
    resetDeps: [isActive, id_deudor, id_cartera],
  });

  const columnsResumidas: Column[] = useMemo(() => [
    { key: 'nro', label: 'Nro', render: (row: EstadoGestion) => <span style={{ fontWeight: 700, color: '#1a2540' }}>{row.nro}</span> },
    { key: 'fecha', label: 'Fecha' },
    { key: 'operador', label: 'Operador', render: (row: EstadoGestion) => <WrapCell>{row.operador}</WrapCell> },
    { key: 'documento', label: 'Documento' },
    { key: 'operacion', label: 'Operación', render: (row: EstadoGestion) => <span className="badge badge-info" style={{ fontSize: '10px', textTransform: 'uppercase' }}>{row.operacion}</span> },
    { key: 'resultado', label: 'Resultado', render: (row: EstadoGestion) => <WrapCell color={row.resultado.includes('Contactado') ? '#166534' : '#991b1b'} weight={500}>{row.resultado}</WrapCell> },
    { key: 'comentario', label: 'Comentario', render: (row: EstadoGestion) => <WrapCell>{row.comentario}</WrapCell> },
  ], []);

  const columnsExpandidas: Column[] = useMemo(() => [
    { key: 'nro', label: 'Nro', render: (row: EstadoGestionCompleta) => <span style={{ fontWeight: 700, color: '#1a2540' }}>{row.nro}</span> },
    { key: 'cliente', label: 'Cliente', render: (row: EstadoGestionCompleta) => <WrapCell>{row.cliente}</WrapCell> },
    { key: 'cartera', label: 'Cartera', render: (row: EstadoGestionCompleta) => <WrapCell>{row.cartera}</WrapCell> },
    { key: 'campana', label: 'Campaña' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'gestor', label: 'Gestor', render: (row: EstadoGestionCompleta) => <WrapCell>{row.gestor}</WrapCell> },
    { key: 'documento', label: 'Documento' },
    { key: 'operacion', label: 'Operación', render: (row: EstadoGestionCompleta) => <span className="badge badge-info" style={{ fontSize: '10px', textTransform: 'uppercase' }}>{row.operacion}</span> },
    { key: 'resultado', label: 'Resultado', render: (row: EstadoGestionCompleta) => <WrapCell color={row.resultado.includes('Contactado') ? '#166534' : '#991b1b'} weight={500}>{row.resultado}</WrapCell> },
    { key: 'comentario', label: 'Comentario', render: (row: EstadoGestionCompleta) => <WrapCell>{row.comentario}</WrapCell> },
  ], []);

  // ─── ESTADOS DE CARGA/ERROR ───
  if (!isActive) return null;

  if (isLoading) {
    return (
      <PanelLayout title="ESTADO DE GESTIÓN REALIZADA" isActive={isActive}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <span>Cargando estados de gestión...</span>
        </div>
      </PanelLayout>
    );
  }

  if (error) {
    return (
      <PanelLayout title="ESTADO DE GESTIÓN REALIZADA" isActive={isActive}>
        <div style={{ padding: '2rem', color: '#c00' }}>
          <p>Error al cargar: {error}</p>
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
        // ─── VISTA RESUMIDA ───
        <div style={{ padding: '16px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              {resumido.datosFiltrados.length} estado(s) de gestión filtrado(s)
            </span>
          </div>

          <Table
            columns={columnsResumidas}
            data={resumido.datosPaginados}
            emptyMessage="No se encontraron estados de gestión"
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
        // ─── VISTA EXPANDIDA ───
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                {expandido.datosFiltrados.length} estado(s) de gestión en total (filtrados)
              </span>
              <ActionButton label="Volver" variant="secondary" size="sm" icon="◀" onClick={handleVolver} />
            </div>

            <Table
              columns={columnsExpandidas}
              data={expandido.datosPaginados}
              emptyMessage="No se encontraron estados de gestión"
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

export default PanelEstadoGestionRealizada;