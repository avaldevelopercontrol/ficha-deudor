import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '../../auth/contexts/authContextValue';

import Table from '../../../shared/components/table/Table';
import Paginacion from '../../../shared/components/ui/Paginacion';
import { ActionButton } from '../../../shared/components/ui/ActionButton';
import { InputField } from '../../../shared/components/ui/InputField';
import { SelectField } from '../../../shared/components/ui/SelectField';
import { WrapCell } from '../../../shared/components/ui/WrapCell';

import type { Column } from '../../../shared/types';

import { useDashboardDeudores } from '../hooks/useDashboardDeudores';
import {
  TIPO_BUSQUEDA_DASHBOARD_OPTIONS,
  type DeudorDashboard,
} from '../types/dashboardDeudor.types';

import '../styles/22-dashboard.css';

const formatMoney = (value: number): string => {
  return value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { usuario, clienteSeleccionada, logout } = useAuth();

  const idCliente =
    searchParams.get('id_cliente') ||
    clienteSeleccionada?.id_cliente ||
    '';

  const idUsuario =
    searchParams.get('id_usuario') ||
    usuario?.id_usuario ||
    '';

  const {
    tipoBusqueda,
    valorBusqueda,
    setTipoBusqueda,
    setValorBusqueda,

    paginatedData,
    isLoading,
    error,

    pageNumber,
    pageSize,
    totalRecords,
    totalPages,
    setPageNumber,
    setPageSize,

    buscar,
    limpiar,
  } = useDashboardDeudores(idCliente);

  const indiceInicio = (pageNumber - 1) * pageSize;
  const indiceFin = Math.min(indiceInicio + pageSize, totalRecords);

  const columns: Column[] = useMemo(
    () => [
      {
        key: 'nro',
        label: 'Nro',
        width: '60px',
      },
      {
        key: 'zonaCampanna',
        label: 'Zona - Campaña',
        width: '150px',
        render: (row: DeudorDashboard) => (
          <WrapCell>{row.zonaCampanna || '—'}</WrapCell>
        ),
      },
      {
        key: 'cartera',
        label: 'Cartera',
        width: '170px',
        render: (row: DeudorDashboard) => (
          <WrapCell>{row.cartera || '—'}</WrapCell>
        ),
      },
      {
        key: 'codigoCliente',
        label: 'Cod.Cliente',
        width: '110px',
      },
      {
        key: 'deudor',
        label: 'Deudor',
        width: '220px',
        render: (row: DeudorDashboard) => (
          <WrapCell weight={600}>{row.deudor || '—'}</WrapCell>
        ),
      },
      {
        key: 'importe',
        label: 'Importe',
        width: '120px',
        render: (row: DeudorDashboard) => formatMoney(row.importe),
      },
      {
        key: 'saldo',
        label: 'Saldo',
        width: '120px',
        render: (row: DeudorDashboard) => formatMoney(row.saldo),
      },
      {
        key: 'fechaUltimaGestionCALL',
        label: 'Ult. Gestión',
        group: 'gestionCall',
        groupLabel: 'Gestión Call',
        width: '120px',
        render: (row: DeudorDashboard) => (
          <WrapCell>{row.fechaUltimaGestionCALL || '—'}</WrapCell>
        ),
      },
      {
        key: 'ultimaGestionCALL',
        label: 'Status',
        group: 'gestionCall',
        groupLabel: 'Gestión Call',
        width: '280px',
        render: (row: DeudorDashboard) => (
          <WrapCell>{row.ultimaGestionCALL || '—'}</WrapCell>
        ),
      },
      {
        key: 'cantidadGestionCALL',
        label: 'Cantidad',
        group: 'gestionCall',
        groupLabel: 'Gestión Call',
        width: '90px',
      },
      {
        key: 'fechaUltimaGestionCAMPO',
        label: 'Ult. Gestión',
        group: 'gestionCampo',
        groupLabel: 'Gestión Campo',
        width: '120px',
        render: (row: DeudorDashboard) => (
          <WrapCell>{row.fechaUltimaGestionCAMPO || '—'}</WrapCell>
        ),
      },
      {
        key: 'ultimaGestionCAMPO',
        label: 'Status',
        group: 'gestionCampo',
        groupLabel: 'Gestión Campo',
        width: '280px',
        render: (row: DeudorDashboard) => (
          <WrapCell>{row.ultimaGestionCAMPO || '—'}</WrapCell>
        ),
      },
      {
        key: 'cantidadGestionCAMPO',
        label: 'Cantidad',
        group: 'gestionCampo',
        groupLabel: 'Gestión Campo',
        width: '90px',
      },
      {
        key: 'fechaPromesa',
        label: 'Fecha Promesa',
        width: '130px',
        render: (row: DeudorDashboard) => (
          <WrapCell>{row.fechaPromesa || '—'}</WrapCell>
        ),
      },
      {
        key: 'mejorStatus',
        label: 'Mejor Status',
        width: '150px',
        render: (row: DeudorDashboard) => (
          <WrapCell>{row.mejorStatus || '—'}</WrapCell>
        ),
      },
    ],
    []
  );

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleGoToFichaDeudor = (row: DeudorDashboard) => {
    const queryParams = new URLSearchParams({
      id_cliente: String(row.nId_Cliente || idCliente),
      id_cartera: String(row.nId_Cartera),
      id_deudor: String(row.nId_PersDeudor),
      id_contrato: String(row.nId_Contrato),
      id_usuario: String(idUsuario),
      fecha_inicio_gestion: new Date().toISOString(),
    });

    navigate(`/ficha-deudor?${queryParams.toString()}`);
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      buscar();
    }
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header__brand">
          <span className="logo-text">AVAL</span>
          <span className="logo-sub">PERÚ</span>
        </div>
        <nav className="app-nav">
          <span className="nav-item">GESTIÓN DE COBRANZAS</span>
          <span className="nav-sep">›</span>
          <span className="nav-item nav-item--active">GESTIÓN POR PERSONA/DEUDOR </span>
        </nav>
        <div className="dashboard-header__user">
          <span>
            <strong>Usuario:</strong> {usuario?.nombre} {usuario?.apellido}
          </span>

          <span>•</span>

          <span>
            <strong>Cliente:</strong> {clienteSeleccionada?.nombre}
          </span>

          <button
            type="button"
            className="dashboard-header__logout"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="dashboard-card dashboard-card--search">
          <div className="dashboard-search-layout">
            <div className="dashboard-search-info">
              <div className="dashboard-search-icon">
                🔎
              </div>

              <div>
                <h2 className="dashboard-card__title">Búsqueda de deudor</h2>
                <p className="dashboard-card__subtitle">
                  Seleccione el tipo de búsqueda e ingrese el dato correspondiente.
                </p>

                <div className="dashboard-search-tags">
                  <span>RUC</span>
                  <span>DNI</span>
                  <span>Teléfono</span>
                </div>
              </div>
            </div>

            <div className="dashboard-search-panel">
              <div className="dashboard-search-row">
                <div className="dashboard-search-field dashboard-search-field--type">
                  <SelectField
                    label="Tipo de búsqueda"
                    options={TIPO_BUSQUEDA_DASHBOARD_OPTIONS}
                    value={tipoBusqueda}
                    onChange={setTipoBusqueda}
                    disabled={isLoading}
                    hidePlaceholder
                  />
                </div>

                <div className="dashboard-search-field dashboard-search-field--value">
                  <InputField
                    label="Dato"
                    value={valorBusqueda}
                    onChange={(event) => setValorBusqueda(event.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Ingrese RUC, DNI o teléfono"
                    disabled={isLoading}
                  />
                </div>

                <div className="dashboard-search-actions">
                  <ActionButton
                    label={isLoading ? 'Buscando...' : 'Buscar'}
                    icon="🔎"
                    variant="primary"
                    onClick={buscar}
                  />

                  <ActionButton
                    label="Limpiar"
                    variant="secondary"
                    onClick={limpiar}
                  />
                </div>
              </div>

              {error && (
                <div className="dashboard-error">
                  {error}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="dashboard-card dashboard-card--results">
          <div className="dashboard-results-header">
            <div>
              <h2 className="dashboard-card__title">Listado de Gestión</h2>
              <p className="dashboard-card__subtitle">
                Seleccione un registro para abrir la ficha del deudor.
              </p>
            </div>

            <span className="dashboard-results-count">
              {totalRecords} registro(s)
            </span>
          </div>

          {isLoading ? (
            <p className="dashboard-message">Buscando deudores...</p>
          ) : (
            <>
              <Table
                columns={columns}
                data={paginatedData}
                onRowClick={handleGoToFichaDeudor}
                emptyMessage="Sin registros para mostrar"
                fitToPanel={false}
              />

              {totalRecords > 0 && (
                <Paginacion
                  paginaActual={pageNumber}
                  totalPaginas={totalPages}
                  totalRegistros={totalRecords}
                  indiceInicio={indiceInicio}
                  indiceFin={indiceFin}
                  onPaginaAnterior={() =>
                    setPageNumber(Math.max(1, pageNumber - 1))
                  }
                  onPaginaSiguiente={() =>
                    setPageNumber(Math.min(totalPages, pageNumber + 1))
                  }
                  onIrAPagina={setPageNumber}
                  showPageSizeSelector
                  pageSize={pageSize}
                  pageSizeOptions={[5, 10, 30, 50]}
                  onPageSizeChange={setPageSize}
                />
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;