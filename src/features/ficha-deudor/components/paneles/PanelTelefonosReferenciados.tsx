// src/components/paneles/PanelTelefonosReferenciados.tsx
import React, { useMemo, useState } from 'react';
import Table from '../../../../shared/components/table/Table';
import { ActionButton } from '../../../../shared/components/ui';
import Paginacion from '../../../../shared/components/ui/Paginacion';
import { WrapCell } from '../../../../shared/components/ui/WrapCell';
import { Badge } from '../../../../shared/components/ui/Badge';
import { PanelLayout } from './PanelLayout';
import { usePaginatedTable } from '../../../../shared/hooks/ui/usePaginatedTable';
import { useTelefonosReferenciados } from '../../hooks/useTelefonosReferenciados';
import type { Column, TelefonoReferenciado, TelefonoFormData } from '../../../../shared/types';
import ModalRegistrarTelefono from '../modals/accionesRapidas/ModalRegistrarTelefono';
import ModalEditarTelefono from '../modals/accionesRapidas/ModalEditarTelefono';

interface Props {
  isActive: boolean;
  id_deudor: string;
  id_cartera: string;
}

const PanelTelefonosReferenciados: React.FC<Props> = ({ isActive, id_deudor, id_cartera }) => {
  const { data, isLoading, error, create, update } = useTelefonosReferenciados(id_deudor, id_cartera);

  const [showRegistrar, setShowRegistrar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [telefonoEditar, setTelefonoEditar] = useState<TelefonoReferenciado | null>(null);

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
  } = usePaginatedTable<TelefonoReferenciado>({
    data,
    resetDeps: [isActive, id_deudor, id_cartera],
  });

  const handleEdit = (row: TelefonoReferenciado) => {
    setTelefonoEditar(row);
    setShowEditar(true);
  };

  const handleGuardarEdicion = async (formData: TelefonoFormData & { id: string }) => {
    try {
      await update(formData.id, formData);
      setShowEditar(false);
      setTelefonoEditar(null);
    } catch (err) {
      console.error('Error al guardar edición:', err);
      // Aquí podrías mostrar un toast de error
    }
  };
  const columns: Column[] = useMemo(() => [
    { key: 'prioridad', label: 'Prioridad' },
    { key: 'numero', label: 'Número' },
    { key: 'horario', label: 'Horario', render: (row: TelefonoReferenciado) => <WrapCell>{row.horario}</WrapCell> },
    { key: 'refUbicacion', label: 'Ref. Ubicación', render: (row: TelefonoReferenciado) => <WrapCell>{row.refUbicacion}</WrapCell> },
    {
      key: 'estado',
      label: 'Estado',
      render: (row: TelefonoReferenciado) => (
        <Badge variant={row.estado === 'OPERATIVO' ? 'success' : 'neutral'} style={{ padding: '3px 8px', borderRadius: '10px', fontSize: '11px' }}>
          {row.estado || '—'}
        </Badge>
      ),
    },
    { key: 'fechaEstado', label: 'Fecha Estado' },
    { key: 'fechaBase', label: 'Fecha Base' },
    { key: 'contactados', label: 'Contactados', render: (row: TelefonoReferenciado) => <WrapCell weight={500}>{`${row.contactados}%`}</WrapCell> },
    { key: 'noContactados', label: 'No Contactados' },
    { key: 'ivr', label: 'IVR' },
    { key: 'fuente', label: 'Fuente', render: (row: TelefonoReferenciado) => <WrapCell>{row.fuente}</WrapCell> },
    { key: 'ordenSearch', label: 'Orden Search' },
    {
      key: 'acciones',
      label: 'Editar',
      width: '55px',      
      filterable: false,
      render: (row: TelefonoReferenciado) => (
        <ActionButton label="" variant="primary" size="sm" icon="✎" onClick={() => handleEdit(row)} />
      ),
    },
  ], []);

  const handleRegistrar = async (formData: TelefonoFormData) => {
    console.log('📥 PANEL: handleRegistrar llamado', formData);
    
    try {
      console.log('⏳ PANEL: Llamando create...');
      await create(formData);
      console.log('✅ PANEL: create exitoso, cerrando modal');
      setShowRegistrar(false);
    } catch (err) {
      console.error('❌ PANEL: Error en handleRegistrar:', err);
      // Aquí podrías mostrar un toast de error
    }
  };

  // ─── ESTADOS DE CARGA/ERROR ───
  if (!isActive) return null;

  if (isLoading) {
    return (
      <PanelLayout title="TELÉFONOS REFERENCIADOS" isActive={isActive}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <span>Cargando teléfonos...</span>
        </div>
      </PanelLayout>
    );
  }

  if (error) {
    return (
      <PanelLayout title="TELÉFONOS REFERENCIADOS" isActive={isActive}>
        <div style={{ padding: '2rem', color: '#c00' }}>
          <p>Error al cargar: {error}</p>
        </div>
      </PanelLayout>
    );
  }

  return (
    <>
      <PanelLayout title="TELÉFONOS REFERENCIADOS" isActive={isActive}>
        <div style={{ padding: '16px 0' }}>
          {/* Header con contador y botón */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              Mostrando {indiceInicio + 1}-{indiceFin} de {datosFiltrados.length} teléfono(s)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#6b7a99' }}>
                Página {paginaActual} de {totalPaginas}
              </span>
              <ActionButton
                label="Agregar Teléfono"
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
            emptyMessage="No se encontraron teléfonos referenciados"
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

      <ModalRegistrarTelefono 
        isOpen={showRegistrar} 
        onClose={() => setShowRegistrar(false)} 
        onRegistrar={handleRegistrar}
      />
      <ModalEditarTelefono
        isOpen={showEditar}
        onClose={() => { setShowEditar(false); setTelefonoEditar(null); }}
        telefono={telefonoEditar}
        onGuardar={handleGuardarEdicion}
      />
    </>
  );
};

export default PanelTelefonosReferenciados;