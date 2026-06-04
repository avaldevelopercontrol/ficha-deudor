import React, { useMemo, useState } from 'react';
import Table from '../../../../shared/components/table/Table';
import ModalRegistrarDireccion from '../modals/accionesRapidas/ModalRegistrarDireccion';
import ModalEditarDireccion from '../modals/accionesRapidas/ModalEditarDireccion';
import { ActionButton } from '../../../../shared/components/ui';
import Paginacion from '../../../../shared/components/ui/Paginacion';
import { WrapCell } from '../../../../shared/components/ui/WrapCell';
import { PanelLayout } from './PanelLayout';
import { usePaginatedTable } from '../../../../shared/hooks/ui/usePaginatedTable';
import { useDireccionesReferenciadas } from '../../hooks/useDireccionesReferenciadas';
import type { Column, DireccionReferenciada, DireccionEditFormData, DireccionFormData } from '../../../../shared/types';

interface Props {
  isActive: boolean;
  id_deudor: string;
  id_cartera: string;
}

const ESTADOS_BADGE: Record<string, string> = {
  OPERATIVO: 'badge-s',
  INACTIVO: 'badge-d',
  PENDIENTE: 'badge-w',
  VERIFICAR: 'badge-info',
  ELIMINADO: 'badge-n',
};

const PanelDireccionesReferenciadas: React.FC<Props> = ({ isActive, id_deudor, id_cartera }) => {
  const { data, isLoading, error, setData, create, update } = useDireccionesReferenciadas(id_deudor, id_cartera);

  const [showRegistrar, setShowRegistrar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [direccionEditar, setDireccionEditar] = useState<DireccionReferenciada | null>(null);

  const {
    paginaActual,
    setPaginaActual,
    pageSize,
    setPageSize,
    totalPaginas,
    indiceInicio,
    indiceFin,
    datosPaginados,
    datosFiltrados,
    textFilters,
    selectedFilters,
    onTextFilterChange,
    onSelectedFilterChange,
  } = usePaginatedTable<DireccionReferenciada>({
    data,
    resetDeps: [isActive, id_deudor, id_cartera],
  });

  const handleEdit = (row: DireccionReferenciada) => {
    setDireccionEditar(row);
    setShowEditar(true);
  };

  const handleGuardarEdicion = async (formData: DireccionEditFormData & { id: string }) => {
    try {
      await update(formData.id, formData);
      setShowEditar(false);
      setDireccionEditar(null);
    } catch (err) {
      console.error('Error al guardar edición:', err);
    }
  };

  const columns: Column[] = useMemo(() => [
    {
      key: 'direccion',
      label: 'Dirección',
      render: (row: DireccionReferenciada) => <WrapCell>{row.direccion}</WrapCell>,
    },
    {
      key: 'refUbicacion',
      label: 'Ref. Ubicación',
      render: (row: DireccionReferenciada) => <WrapCell>{row.refUbicacion}</WrapCell>,
    },
    {
      key: 'tipoDeudor',
      label: 'Tipo Deudor',
      render: (row: DireccionReferenciada) => (
        <span className={`badge ${row.tipoDeudor === 'Titular' ? 'badge-s' : 'badge-info'}`}>
          {row.tipoDeudor}
        </span>
      ),
    },
    {
      key: 'nombre',
      label: 'Nombre',
      render: (row: DireccionReferenciada) => <WrapCell weight={500}>{row.nombre}</WrapCell>,
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (row: DireccionReferenciada) => {
        const badgeClass = ESTADOS_BADGE[row.estado] || 'badge-n';
        return <span className={`badge ${badgeClass}`}>{row.estado || '—'}</span>;
      },
    },
    {
      key: 'acciones',
      label: 'Editar',
      width: '55px',
      filterable: false,
      render: (row: DireccionReferenciada) => (
        <ActionButton label="" variant="primary" size="sm" icon="✎" onClick={() => handleEdit(row)} />
      ),
    },
  ], []);

  // ─── ESTADOS DE CARGA/ERROR ───
  if (!isActive) return null;

  if (isLoading) {
    return (
      <PanelLayout title="DIRECCIONES REFERENCIADAS" isActive={isActive}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <span>Cargando direcciones...</span>
        </div>
      </PanelLayout>
    );
  }

  if (error) {
    return (
      <PanelLayout title="DIRECCIONES REFERENCIADAS" isActive={isActive}>
        <div style={{ padding: '2rem', color: '#c00' }}>
          <p>Error al cargar: {error}</p>
        </div>
      </PanelLayout>
    );
  }

  const handleRegistrar = async (formData: DireccionFormData) => {
    try {
      await create(formData);
      setShowRegistrar(false);
    } catch (err) {
      console.error('Error al registrar dirección:', err);
    }
  };
  
  return (
    <>
      <PanelLayout title="DIRECCIONES REFERENCIADAS" isActive={isActive}>
        <div style={{ padding: '16px 0' }}>
          {/* Header con info y botón */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              Mostrando {indiceInicio + 1}-{indiceFin} de {datosFiltrados.length} dirección(es)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#6b7a99' }}>
                Página {paginaActual} de {totalPaginas}
              </span>
              <ActionButton
                label="Agregar Dirección"
                variant="primary"
                size="sm"
                icon="＋"
                onClick={() => setShowRegistrar(true)}
              />
            </div>
          </div>

          <Table
            columns={columns}
            data={datosPaginados}
            emptyMessage="No se encontraron direcciones referenciadas"
            enableColumnFilters={true}
            allData={data}
            textFilters={textFilters}
            selectedFilters={selectedFilters}
            onTextFilterChange={onTextFilterChange}
            onSelectedFilterChange={onSelectedFilterChange}
          />

          <Paginacion
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            totalRegistros={datosFiltrados.length}
            indiceInicio={indiceInicio}
            indiceFin={indiceFin}
            onPaginaAnterior={() => setPaginaActual(p => Math.max(1, p - 1))}
            onPaginaSiguiente={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
            onIrAPagina={setPaginaActual}
            showPageSizeSelector={true}
            pageSize={pageSize}
            pageSizeOptions={[5, 10, 30, 50]}
            onPageSizeChange={setPageSize}
          />
        </div>
      </PanelLayout>

      <ModalRegistrarDireccion 
        isOpen={showRegistrar} 
        onClose={() => setShowRegistrar(false)} 
        onRegistrar={handleRegistrar}
      />
      <ModalEditarDireccion
        isOpen={showEditar}
        onClose={() => { setShowEditar(false); setDireccionEditar(null); }}
        direccion={direccionEditar}
        onGuardar={handleGuardarEdicion}
      />
    </>
  );
};

export default PanelDireccionesReferenciadas;