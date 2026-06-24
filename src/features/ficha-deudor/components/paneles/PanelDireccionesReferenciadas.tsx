import React, { useMemo, useState } from 'react';
import Table from '../../../../shared/components/table/Table';
import ModalRegistrarDireccion from '../modals/accionesRapidas/ModalRegistrarDireccion';
import ModalEditarDireccion from '../modals/accionesRapidas/ModalEditarDireccion';
import { ActionButton } from '../../../../shared/components/ui';
import Paginacion from '../../../../shared/components/ui/Paginacion';
import { WrapCell } from '../../../../shared/components/ui/WrapCell';
import { PanelLayout } from './PanelLayout';
import { useDireccionById, useDireccionesReferenciadas } from '../../hooks/useDireccionesReferenciadas';
import type { Column, DireccionReferenciada, DireccionEditFormData, DireccionFormData } from '../../../../shared/types';

interface Props {
  isActive: boolean;
  id_cliente: string;
  id_deudor: string;
  id_usuario: string;
}

const ESTADOS_BADGE: Record<string, string> = {
  ACTIVO: 'badge-s',
  INACTIVO: 'badge-d',
};

const PanelDireccionesReferenciadas: React.FC<Props> = ({ isActive, id_cliente, id_deudor, id_usuario }) => {
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
  } = useDireccionesReferenciadas(id_cliente, id_deudor, id_usuario);

  const [showRegistrar, setShowRegistrar] = useState(false);
  const [showEditar, setShowEditar] = useState(false);
  const [direccionEditarId, setDireccionEditarId] = useState<string | null>(null);  // ← CORREGIDO: era direccionEditar

  const { data: direccionByIdData } = useDireccionById(direccionEditarId);

  const handleEdit = (row: DireccionReferenciada) => {
    setDireccionEditarId(row.id); 
    setShowEditar(true);
  };

  const handleGuardarEdicion = async (formData: DireccionEditFormData) => {
    try {
      await update(formData.id, formData);
      setShowEditar(false);
      setDireccionEditarId(null);  // ← CORREGIDO
    } catch (err) {
      console.error('Error al guardar edición:', err);
    }
  };

  // ─── Columnas estáticas (desde la 2da columna de la API en adelante) ───
  const columns: Column[] = useMemo(
    () => [
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
    ],
    []
  );

  const handleRegistrar = async (formData: DireccionFormData) => {
    try {
      await create(formData);
      setShowRegistrar(false);
    } catch (err) {
      console.error('Error al registrar dirección:', err);
    }
  };

  const indiceInicio = (pageNumber - 1) * pageSize;
  const indiceFin = Math.min(pageNumber * pageSize, totalRecords);

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
          <p style={{ marginBottom: 12 }}>Error al cargar direcciones:</p>
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
      <PanelLayout title="DIRECCIONES REFERENCIADAS" isActive={isActive}>
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
              Mostrando {indiceInicio + 1}-{indiceFin} de {totalRecords} dirección(es)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#6b7a99' }}>
                Página {pageNumber} de {totalPages}
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
            data={paginatedData}
            emptyMessage="No se encontraron direcciones referenciadas"
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

      <ModalRegistrarDireccion
        isOpen={showRegistrar}
        onClose={() => setShowRegistrar(false)}
        onRegistrar={handleRegistrar}
      />
      <ModalEditarDireccion
        isOpen={showEditar}
        onClose={() => {
          setShowEditar(false);
          setDireccionEditarId(null);  // ← CORREGIDO
        }}
        direccionId={direccionEditarId}        // ← CORREGIDO: pasar ID
        direccionData={direccionByIdData}      // ← pasar datos del GET
        onGuardar={handleGuardarEdicion}
      />
    </>
  );
};

export default PanelDireccionesReferenciadas;