import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import DeudorHeader from '../components/ficha/DeudorHeader';
import AccionesRapidas from '../components/ficha/AccionesRapidas';
import DocumentosTable from '../components/ficha/DocumentosTable';
import FichaGestion from '../components/ficha/FichaGestion';
import PanelDatosAdicionales from '../components/paneles/PanelDatosAdicionales';
import PanelTelefonosReferenciados from '../components/paneles/PanelTelefonosReferenciados';
import PanelDireccionesReferenciadas from '../components/paneles/PanelDireccionesReferenciadas';
import PanelEstadoGestionRealizada from '../components/paneles/PanelEstadoGestionRealizada';
import PanelGestionRealizada from '../components/paneles/PanelGestionRealizada';
import { DeudorProvider } from '../contexts/DeudorContext';
import { useDeudorHeader } from '../hooks/useDeudorHeader';
import type { GestionForm } from '../../../shared/types/indexApi';
import { useAuth } from '../../auth/hooks';

interface FichaContentProps {
  id_cliente: string;
  id_cartera: string;
  id_deudor: string;
  id_contrato: string;
  id_usuario: string;
}

const FichaContent: React.FC<FichaContentProps> = ({ 
  id_cliente, 
  id_cartera, 
  id_deudor, 
  id_contrato, 
  id_usuario 
}) => {
  const { usuario, clienteSeleccionada } = useAuth();
  const [contacto, setContacto] = useState('');
  const [panelActivo, setPanelActivo] = useState<string | null>(null);
  
  const { data: deudorData } = useDeudorHeader(id_cliente, id_cartera, id_deudor);

  const handleGestionSubmit = (data: GestionForm) => {
    const payload = { ...data, id_cliente, id_cartera, id_deudor, id_contrato, id_usuario };
    console.log('JSON listo para enviar al backend:', payload);
    alert('Gestión guardada. Revisa la consola.');
  };

  const handleTogglePanel = (accion: string) => {
    setPanelActivo((actual) => (actual === accion ? null : accion));
  };

  return (
    <DeudorProvider value={deudorData ?? null}>
      <div>
        <header className="app-header">
          <div className="app-logo">
            <span className="logo-text">AVAL</span>
            <span className="logo-sub">PERÚ</span>
          </div>
          <nav className="app-nav">
            <span className="nav-item">GESTIÓN DE COBRANZAS</span>
            <span className="nav-sep">›</span>
            <span className="nav-item nav-item--active">FICHA DEUDOR</span>
          </nav>
          <div className="dashboard-header__user">
            <span>
              <strong>Usuario:</strong> {usuario?.nombre} {usuario?.apellido}
            </span>

            <span>•</span>

            <span>
              <strong>Cliente:</strong> {clienteSeleccionada?.nombre}
            </span>
          </div>
        </header>

        <main className="ficha-main ficha-main--two-columns">
          <aside className="ficha-sidebar">
            {deudorData && (
              <DeudorHeader 
                id_cliente={id_cliente}
                id_cartera={id_cartera}
                id_deudor={id_deudor}
                contacto={contacto}
                onContactoChange={setContacto}
                compact={true}
              />
            )}
            <AccionesRapidas 
              panelActivo={panelActivo} 
              onTogglePanel={handleTogglePanel} 
            />
          </aside>
          
          <div className="ficha-content">
            {deudorData && (<DocumentosTable id_cliente={id_cliente} id_cartera={id_cartera} id_deudor={id_deudor} id_contrato={id_contrato} id_usuario={id_usuario} data={deudorData}/>)}
            <PanelDatosAdicionales isActive={panelActivo === 'DATOS ADICIONALES'} id_cliente={id_cliente} id_cartera={id_cartera} id_deudor={id_deudor}/>
            <PanelTelefonosReferenciados isActive={panelActivo === 'TELÉFONOS REFERENCIADOS'} id_cliente={id_cliente} id_deudor={id_deudor} id_usuario={id_usuario}/>
            <PanelDireccionesReferenciadas isActive={panelActivo === 'DIRECCIONES REFERENCIADAS'} id_cliente={id_cliente} id_deudor={id_deudor} id_usuario={id_usuario} />
            <PanelGestionRealizada isActive={panelActivo === 'GESTIÓN REALIZADA'} id_cliente={id_cliente} id_cartera={id_cartera} id_deudor={id_deudor} id_usuario={id_usuario}/>
            <PanelEstadoGestionRealizada isActive={panelActivo === 'ESTADO DE GESTIÓN REALIZADA'} id_cliente={id_cliente} id_cartera={id_cartera} id_deudor={id_deudor}/>
            <FichaGestion onSubmit={handleGestionSubmit} idCliente={id_cliente} idCartera={id_cartera} idContrato={id_contrato}/>
          </div>
        </main>
      </div>
    </DeudorProvider>
  );
};

const FichaDeudor: React.FC = () => {
  // ← NUEVO: Usar useSearchParams en lugar de ParamGuard
  const [searchParams] = useSearchParams();
  
  const id_cliente = searchParams.get('id_cliente');
  const id_cartera = searchParams.get('id_cartera');
  const id_deudor = searchParams.get('id_deudor');
  const id_contrato = searchParams.get('id_contrato');
  const id_usuario = searchParams.get('id_usuario');

  // Validar que todos los parámetros existan
  if (!id_cliente || !id_cartera || !id_deudor || !id_contrato || !id_usuario) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'sans-serif', color: '#c00' }}>
        <h2>Error: Parámetros faltantes</h2>
        <p>La URL debe incluir: id_cliente, id_cartera, id_deudor, id_contrato, id_usuario</p>
        <p>Ejemplo: ?id_cliente=178&id_cartera=45&id_deudor=999&id_contrato=30&id_usuario=carlos.r</p>
      </div>
    );
  }

  return (
    <FichaContent 
      id_cliente={id_cliente}
      id_cartera={id_cartera}
      id_deudor={id_deudor}
      id_contrato={id_contrato}
      id_usuario={id_usuario}
    />
  );
};

export default FichaDeudor;