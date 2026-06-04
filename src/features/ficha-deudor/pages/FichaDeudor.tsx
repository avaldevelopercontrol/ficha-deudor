import React, { useState } from 'react';
import { ParamGuard } from '../components/ParamGuard';
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
import type { GestionForm } from '../../../shared/types';

interface FichaContentProps {
  id_cliente: string;
  id_cartera: string;
  id_deudor: string;
  id_contrato: string;
  id_usuario: string;
}

const FichaContent: React.FC<FichaContentProps> = ({ id_cliente, id_cartera, id_deudor, id_contrato, id_usuario }) => {
  const [contacto, setContacto] = useState('');
  const [panelActivo, setPanelActivo] = useState<string | null>(null);
  
  const { data: deudorData } = useDeudorHeader(id_cliente, id_cartera); // ← NUEVO

  const handleGestionSubmit = (data: GestionForm) => {
    const payload = { ...data, id_cliente, id_cartera, id_deudor, id_contrato, id_usuario };
    console.log('JSON listo para enviar al backend:', payload);
    alert('Gestión guardada. Revisa la consola.');
  };

  const handleTogglePanel = (accion: string) => {
    setPanelActivo((actual) => (actual === accion ? null : accion));
  };

  return (
    <DeudorProvider value={deudorData ?? null}> {/* ← NUEVO: Envuelve todo */}
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
          <div className="app-user">
            <span className="user-name">Gestor: {id_usuario}</span>
            <span className="user-dot" />
          </div>
        </header>

        <main className="ficha-main ficha-main--two-columns">
          <aside className="ficha-sidebar">
            {deudorData && (
              <DeudorHeader 
                id_cliente={id_cliente}   // ← CORRECTO
                id_cartera={id_cartera}   // ← CORRECTO
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
            <DocumentosTable id_cliente={id_cliente} id_cartera={id_cartera} id_deudor={id_deudor} id_contrato={id_contrato}/>
            <PanelDatosAdicionales isActive={panelActivo === 'DATOS ADICIONALES'} id_cliente={id_cliente} id_cartera={id_cartera} id_deudor={id_deudor}/>
            <PanelTelefonosReferenciados isActive={panelActivo === 'TELÉFONOS REFERENCIADOS'} id_deudor={id_deudor} id_cartera={id_cartera} />
            <PanelDireccionesReferenciadas isActive={panelActivo === 'DIRECCIONES REFERENCIADAS'} id_deudor={id_deudor} id_cartera={id_cartera} />
            <PanelGestionRealizada isActive={panelActivo === 'GESTIÓN REALIZADA'} id_deudor={id_deudor} id_cartera={id_cartera} />
            <PanelEstadoGestionRealizada isActive={panelActivo === 'ESTADO DE GESTIÓN REALIZADA'} id_deudor={id_deudor} id_cartera={id_cartera} />
            <FichaGestion onSubmit={handleGestionSubmit} />
          </div>
        </main>
      </div>
    </DeudorProvider>
  );
};

const FichaDeudor: React.FC = () => {
  return (
    <ParamGuard>
      {(params) => <FichaContent {...params} />}
    </ParamGuard>
  );
};

export default FichaDeudor;