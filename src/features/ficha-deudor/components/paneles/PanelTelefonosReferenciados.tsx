import React, { useMemo, useState } from 'react';
import Table from '../../../../shared/components/table/Table';
import { ActionButton } from '../../../../shared/components/ui';
import Paginacion from '../../../../shared/components/ui/Paginacion';
import { WrapCell } from '../../../../shared/components/ui/WrapCell';
import { Badge } from '../../../../shared/components/ui/Badge';
import { PanelLayout } from './PanelLayout';
import { useTelefonosReferenciados } from '../../hooks/useTelefonosReferenciados';
import type { Column, TelefonoReferenciado, TelefonoFormData } from '../../../../shared/types';
import ModalRegistrarTelefono from '../modals/accionesRapidas/ModalRegistrarTelefono';
import ModalEditarTelefono from '../modals/accionesRapidas/ModalEditarTelefono';

interface Props {
  isActive: boolean;
  id_cliente: string;
  id_deudor: string;
  id_usuario: string;
}

const PanelTelefonosReferenciados: React.FC<Props> = ({ isActive, id_cliente, id_deudor, id_usuario}) => {
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
    create,
    update,
  } = useTelefonosReferenciados(id_cliente, id_deudor, id_usuario);

  const [showRegistrar, setShowRegistrar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [telefonoEditarId, setTelefonoEditarId] = useState<number | null>(null);

  const handleEdit = (row: TelefonoReferenciado) => {
    setTelefonoEditarId(row.id);
    setShowEditar(true);
  };

  const handleGuardarEdicion = async (formData: TelefonoFormData) => {
    try {
      await update(formData.id, formData);
      setShowEditar(false);
      setTelefonoEditarId(null);
    } catch (err) {
      console.error('Error al guardar edición:', err);
    }
  };

  const handleRegistrar = async (formData: TelefonoFormData) => {
    console.log('📥 PANEL: handleRegistrar llamado', formData);
    try {
      console.log('⏳ PANEL: Llamando create...');
      await create(formData);
      console.log('✅ PANEL: create exitoso, cerrando modal');
      setShowRegistrar(false);
    } catch (err) {
      console.error('❌ PANEL: Error en handleRegistrar:', err);
    }
  };

  // ─── Columnas estáticas ───
  const columns: Column[] = useMemo(
    () => [
      { key: 'prioridad', label: 'Prioridad' },
      { key: 'numero', label: 'Número' },
      {
        key: 'horario',
        label: 'Horario',
        render: (row: TelefonoReferenciado) => <WrapCell>{row.horario}</WrapCell>,
      },
      {
        key: 'refUbicacion',
        label: 'Ref. Ubicación',
        render: (row: TelefonoReferenciado) => <WrapCell>{row.refUbicacion}</WrapCell>,
      },
      {
        key: 'estado',
        label: 'Estado',
        render: (row: TelefonoReferenciado) => (
          <Badge
            variant={row.estado === 'OPERATIVO' ? 'success' : 'neutral'}
            style={{ padding: '2px 7px', borderRadius: '10px', fontSize: '9px' }}
          >
            {row.estado || '—'}
          </Badge>
        ),
      },
      { key: 'fechaEstado', label: 'Fecha Estado' },
      { key: 'fechaBase', label: 'Fecha Base' },
      {
        key: 'contactados',
        label: 'Contactados',
        render: (row: TelefonoReferenciado) => (
          <WrapCell weight={500}>{`${row.contactados}`}</WrapCell>
        ),
      },
      { key: 'noContactados', label: 'No Contactados' },
      { key: 'ivr', label: 'IVR' },
      {
        key: 'fuente',
        label: 'Fuente',
        render: (row: TelefonoReferenciado) => <WrapCell>{row.fuente}</WrapCell>,
      },
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
    ],
    []
  );

  const indiceInicio = (pageNumber - 1) * pageSize;
  const indiceFin = Math.min(pageNumber * pageSize, totalRecords);

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
          <p style={{ marginBottom: 12 }}>Error al cargar teléfonos:</p>
          <p style={{ fontSize: '0.9em', color: '#666', marginBottom: 16 }}>{error}</p>
          <button onClick={refetch} style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Reintentar
          </button>
        </div>
      </PanelLayout>
    );
  }

  return (
    <>
      <PanelLayout title="TELÉFONOS REFERENCIADOS" isActive={isActive}>
        <div style={{ padding: '16px 0' }}>
          {/* Header con contador y botón */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              Mostrando {indiceInicio + 1}-{indiceFin} de {totalRecords} teléfono(s)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#6b7a99' }}>
                Página {pageNumber} de {totalPages}
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
            data={paginatedData}
            emptyMessage="No se encontraron teléfonos referenciados"
            enableColumnFilters={true}
            allData={allData} // <-- Todos los filtrados para opciones de filtro
            textFilters={textFilters}
            selectedFilters={selectedFilters}
            onTextFilterChange={onTextFilterChange}
            onSelectedFilterChange={onSelectedFilterChange}
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
        </div>
      </PanelLayout>

      <ModalRegistrarTelefono
        isOpen={showRegistrar}
        onClose={() => setShowRegistrar(false)}
        onRegistrar={handleRegistrar}
      />
      <ModalEditarTelefono
        isOpen={showEditar}
        onClose={() => {
          setShowEditar(false);
          setTelefonoEditarId(null);
        }}
        telefonoId={telefonoEditarId}
        onGuardar={handleGuardarEdicion}
      />
    </>
  );
};

export default PanelTelefonosReferenciados;