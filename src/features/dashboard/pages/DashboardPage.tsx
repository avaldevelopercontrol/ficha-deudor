import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks';
import { ActionButton } from '../../../shared/components/ui';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { usuario, clienteSeleccionada, logout } = useAuth();
  
  const idCliente = searchParams.get('id_cliente');
  const idUsuario = searchParams.get('id_usuario');

  const handleGoToFichaDeudor = () => {

    const idCartera = '34048';
    const idDeudor = '17107600';
    const idContrato = '182';

    navigate(`/ficha-deudor?id_cliente=${idCliente}&id_cartera=${idCartera}&id_deudor=${idDeudor}&id_contrato=${idContrato}&id_usuario=${idUsuario || usuario?.id_usuario}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header__brand">
          <span className="logo-text">AVAL</span>
          <span className="logo-sub">PERÚ</span>
        </div>
        <div className="dashboard-header__user">
          <span>{usuario?.nombre} {usuario?.apellido}</span>
          <span>•</span>
          <span>{clienteSeleccionada?.nombre}</span>
          <button onClick={handleLogout} className="dashboard-header__logout">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <h1>Dashboard de Gestión</h1>
        
        <div className="dashboard-info">
          <div className="info-card">
            <h3>Usuario</h3>
            <p><strong>{usuario?.nombre} {usuario?.apellido}</strong></p>
            <p>{usuario?.email}</p>
            <p>Perfil: {usuario?.perfil}</p>
          </div>
          
          <div className="info-card">
            <h3>Cartera Seleccionada</h3>
            <p><strong>{clienteSeleccionada?.nombre}</strong></p>
            <p>Código: {clienteSeleccionada?.codigo}</p>
          </div>
        </div>

        <div className="dashboard-actions">
          <ActionButton
            label="Ir a Ficha de Deudor"
            onClick={handleGoToFichaDeudor}
            variant="primary"
            size="md"
          />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;