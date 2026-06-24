  import React from 'react';
  import Table from '../../../../shared/components/table/Table';
  import Paginacion from '../../../../shared/components/ui/Paginacion';
  import { WrapCell } from '../../../../shared/components/ui/WrapCell';
  import { Badge } from '../../../../shared/components/ui/Badge';
  import { PanelLayout } from './PanelLayout';
  import { useDatosAdicionales } from '../../hooks/useDatosAdicionales';
  import type { ColumnApi, DatoAdicionalApi } from '../../../../shared/types/indexApi';

  interface Props {
    isActive: boolean;
    id_cliente: string;
    id_cartera: string;
    id_deudor: string;
  }

  const ESTADOS_SERVICIO: Record<string, { variant: 'success' | 'warning' | 'danger' | 'neutral' }> = {
    Activo: { variant: 'success' },
    Suspendido: { variant: 'warning' },
    Cancelado: { variant: 'danger' },
  };

  const PanelDatosAdicionales: React.FC<Props> = ({ isActive, id_cliente, id_cartera, id_deudor }) => {
    const {
      columns,
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
    } = useDatosAdicionales(id_cliente, id_cartera, id_deudor, 3);

    const handleRowClick = (row: DatoAdicionalApi) => {
      console.log('Fila seleccionada:', row);
    };

    // Render cell segun tipo de columna
    const renderCell = (row: DatoAdicionalApi, column: ColumnApi) => {
      const rawValue = row[column.key];

      if (rawValue === null || rawValue === undefined) return '-';

      const value = String(rawValue);

      switch (column.type) {
        case 'money': {
          const numValue = Number(rawValue);
          return isNaN(numValue)
            ? value
            : numValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }

        case 'estado': {
          const config = ESTADOS_SERVICIO[value];
          return <Badge variant={config?.variant || 'neutral'}>{value}</Badge>;
        }

        default:
          return <WrapCell weight={500}>{value}</WrapCell>;
      }
    };

    if (!isActive) return null;

    if (isLoading) {
      return (
        <PanelLayout title="DATOS ADICIONALES" isActive={isActive}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-block',
                width: 20,
                height: 20,
                border: '3px solid #ddd',
                borderTopColor: '#333',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            <p style={{ marginTop: 8, color: '#666' }}>Cargando datos adicionales...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </PanelLayout>
      );
    }

    if (error) {
      return (
        <PanelLayout title="DATOS ADICIONALES" isActive={isActive}>
          <div style={{ padding: '2rem', color: '#c00' }}>
            <p style={{ marginBottom: 12 }}>Error al cargar datos adicionales:</p>
            <p style={{ fontSize: '0.9em', color: '#666', marginBottom: 16 }}>{error}</p>
            <button onClick={refetch} style={{ padding: '8px 16px', cursor: 'pointer' }}>
              Reintentar
            </button>
          </div>
        </PanelLayout>
      );
    }

    return (
      <PanelLayout title="DATOS ADICIONALES" isActive={isActive}>
        <div style={{ padding: '16px 0' }}>
          <Table
            columns={columns.map((col) => ({
              key: col.key,
              label: col.label,
              render: (row: DatoAdicionalApi) => renderCell(row, col),
            }))}
            data={paginatedData}
            onRowClick={handleRowClick}
            emptyMessage="No se encontraron datos adicionales"
            fitToPanel={false}
            enableColumnFilters={true}
            allData={allData}   // <-- CAMBIO: filteredData en vez de paginatedData
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
              indiceInicio={(pageNumber - 1) * pageSize}
              indiceFin={Math.min(pageNumber * pageSize, totalRecords)}
              onPaginaAnterior={() => setPageNumber(Math.max(1, pageNumber - 1))}
              onPaginaSiguiente={() => setPageNumber(Math.min(totalPages, pageNumber + 1))}
              onIrAPagina={setPageNumber}
              showPageSizeSelector={true}
              pageSize={pageSize}
              pageSizeOptions={[5, 10, 20, 50]}
              onPageSizeChange={setPageSize}
            />
          )}
        </div>
      </PanelLayout>
    );
  };

  export default PanelDatosAdicionales;
