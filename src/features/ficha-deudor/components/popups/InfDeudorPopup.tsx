import React, { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Table from '../../../../shared/components/table/Table';
import { useInfDeudor } from '../../hooks/popups/useInfDeudor';
import type { Column, InfDeudorTableRow } from '../../../../shared/types';

const InfDeudorPopup: React.FC = () => {
  const { id_deudor } = useParams<{
    id_cliente: string;
    id_cartera: string;
    id_deudor: string;
    id_usuario: string;
  }>();

  const [searchParams] = useSearchParams();
  const nombre = decodeURIComponent(searchParams.get('nombre') || '');
  const documento = decodeURIComponent(searchParams.get('documento') || '');

  const { rows, isLoading, error, refetch } = useInfDeudor(id_deudor ?? '');

  const handleClose = () => window.close();

  // ─── Detectar qué columnas tienen al menos un dato ───
  const colsWithData = useMemo(() => {
    const set = new Set<number>();
    rows.forEach((row) => {
      for (let i = 1; i <= 80; i++) {
        const idx = i.toString().padStart(2, '0');
        const val = row[`param${idx}`];
        if (val && val.trim()) set.add(i);
      }
    });
    return set;
  }, [rows]);

  // ─── Ancho total para forzar scroll horizontal ───
  const totalWidth = useMemo(() => {
    let w = 0;
    for (let i = 1; i <= 80; i++) {
      w += colsWithData.has(i) ? 100 : 40;
    }
    return w;
  }, [colsWithData]);

  // ─── 80 columnas, cabeceras vacías, ancho dinámico, wrap de texto ───
  const columns: Column[] = useMemo(() => {
    const cols: Column[] = [];
    for (let i = 1; i <= 80; i++) {
      const idx = i.toString().padStart(2, '0');
      const hasData = colsWithData.has(i);
      cols.push({
        key: `param${idx}`,
        label: ' ', // cabecera vacía
        width: hasData ? '100px' : '1px',
        render: (row: InfDeudorTableRow) => {
          const val = row[`param${idx}`];
          if (!val || !val.trim()) return null;
          return (
            <div style={{
              whiteSpace: 'normal',      // ← wrap habilitado
              wordBreak: 'break-word',   // ← corta palabras largas
              lineHeight: '1.3',
              fontSize: 11,
            }}>
              {val}
            </div>
          );
        },
      });
    }
    return cols;
  }, [colsWithData]);

  if (isLoading) {
    return (
      <div className="popup-loading">
        <div className="popup-loading-spinner" />
        <p>Cargando información del deudor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popup-error">
        <div className="popup-error-icon">⚠</div>
        <h4>Error al cargar información</h4>
        <p>{error}</p>
        <div className="popup-error-actions">
          <button className="btn btn-primary" onClick={refetch}>Reintentar</button>
          <button className="btn btn-secondary" onClick={handleClose}>Cerrar</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-text">INF.</span>
          <span className="logo-sub">DEUDOR</span>
        </div>
        <nav className="app-nav">
          <span className="nav-item">GESTIÓN DE COBRANZAS</span>
          <span className="nav-sep">›</span>
          <span className="nav-item nav-item--active">INFORMACION ADICIONAL DEL DEUDOR</span>
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

      <main className="popup-main" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div className="popup-table-wrapper" style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden' }}>
          <div style={{ minWidth: totalWidth }}>
            <Table
              columns={columns}
              data={rows}
              emptyMessage="No se encontró información"
              enableColumnFilters={false}
              allData={rows}
              textFilters={{}}
              selectedFilters={{}}
              onTextFilterChange={() => {}}
              onSelectedFilterChange={() => {}}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default InfDeudorPopup;